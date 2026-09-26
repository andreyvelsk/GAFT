import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { FrontmatterData } from '../../../content/frontmatter';
import {
  mediaFileName,
  selectImages,
  type MediaPlanItem,
} from '../../../content/media';
import {
  mediaItemSchema,
  normalizeReleaseLinks,
  normalizeSectionBody,
  parsePageBody,
  renderPage,
  type MediaItem,
  type PageInput,
  type PageSection,
} from '../../../content/template';
import { MEDIA_LIMITS } from '../../../shared/lib/constants';
import {
  formatPageDate,
  githubUrlFromEntry,
  resolveProjectUrl,
} from '../../../shared/lib/helpers';
import type { ReportEntry } from '../../../shared/lib/types';
import { resolveModel } from '../../model/lib/helpers';
import { createProvider, generateStructured } from '../../provider/lib/helpers';
import type { ContentPage } from '../../tools/content-read';
import { getLatestRelease } from '../../tools/github-release';
import { readRepositoryReadme } from '../../tools/github-readme';
import { searchRepository } from '../../tools/github-search';
import {
  updatePatchSchema,
  type AppliedPatch,
  type UpdateContext,
  type UpdateOptions,
  type UpdatePatch,
  type UpdateResult,
} from './types';

/** Maximum number of `selftext` characters forwarded to the model. */
const MAX_SELFTEXT_LENGTH = 1200;

/** Maximum number of README characters forwarded to the model. */
const MAX_README_LENGTH = 4000;

/** Maximum number of current-page body characters forwarded to the model. */
const MAX_BODY_LENGTH = 4000;

/** Schema validating the media array of an existing page. */
const mediaArraySchema = z.array(mediaItemSchema);

/** Frontmatter keys managed by the template; everything else is preserved. */
const KNOWN_FRONTMATTER_KEYS = new Set([
  'title',
  'description',
  'date',
  'slug',
  'category',
  'media',
]);

/** System prompt describing the page-update task. */
export const UPDATE_SYSTEM_PROMPT = [
  'You update an existing project page for a blog that lists projects built',
  'for the AYN Thor handheld with its two screens.',
  '',
  'You are given the current page, a new Reddit post and, when available, the',
  'project repository, its README and its latest release. Use ONLY the provided',
  'facts — never invent features, versions, links or claims.',
  '',
  'Return a JSON object describing ONLY the fields that must change:',
  '- "title", "description", "category" and "media" (an array of image URLs',
  '  from the post).',
  '- "project_url": the canonical link to the project (repository, store page',
  '  or official site), when it changes.',
  '- "sections": the FULL ordered array of {"heading", "body"} objects when the',
  '  page structure or any section changes. Include ALL sections (not only the',
  '  changed ones). Each "body" must contain ONLY the section text — no "## …"',
  '  heading, no "source:" line and no project link.',
  '- Include a field only when it actually changes; omit unchanged fields.',
  '- Always include "reason": a short English sentence explaining the update.',
  '',
  'Write in English only. When you mention a release, link to the latest',
  'release (the provided release URL ends with "/releases/latest").',
].join('\n');

/** Truncate a string to `max` characters, appending an ellipsis when cut. */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Read a string field from parsed frontmatter, falling back to `fallback`. */
function readString(
  data: FrontmatterData,
  key: string,
  fallback: string,
): string {
  const value = data[key];
  return typeof value === 'string' ? value : fallback;
}

/** Read the media array of an existing page, ignoring invalid entries. */
function readMedia(data: FrontmatterData): MediaItem[] {
  const parsed = mediaArraySchema.safeParse(data.media);
  return parsed.success ? parsed.data : [];
}

/** Collect the frontmatter keys that are not managed by the template. */
function readExtraFrontmatter(
  data: FrontmatterData,
): Record<string, unknown> {
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!KNOWN_FRONTMATTER_KEYS.has(key)) {
      extra[key] = value;
    }
  }
  return extra;
}

/** Whether two ordered section lists are identical. */
function sameSections(
  a: readonly PageSection[],
  b: readonly PageSection[],
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Return the next value, recording the field name when it actually changes. */
function pickChanged(
  name: string,
  next: string | undefined,
  current: string,
  changed: string[],
): string {
  if (next === undefined) {
    return current;
  }
  if (next !== current) {
    changed.push(name);
  }
  return next;
}

/** Build the user prompt for the current page, the post and the context. */
export function buildUpdatePrompt(
  page: ContentPage,
  entry: ReportEntry,
  context: UpdateContext,
): string {
  const current = {
    slug: page.slug,
    frontmatter: page.frontmatter,
    body: truncate(page.content, MAX_BODY_LENGTH),
  };
  const post = {
    id: entry.id,
    title: entry.title,
    selftext: truncate(entry.selftext, MAX_SELFTEXT_LENGTH),
    external_url: entry.external_url,
    flair: entry.flair,
    images: entry.images,
  };
  const repo =
    context.repo === null
      ? null
      : {
          fullName: context.repo.fullName,
          htmlUrl: context.repo.htmlUrl,
          description: context.repo.description,
        };
  const release =
    context.release === null
      ? null
      : {
          tagName: context.release.tagName,
          name: context.release.name,
          url: context.release.url,
        };
  const readme =
    context.readme === null
      ? null
      : truncate(context.readme, MAX_README_LENGTH);

  return [
    'Update the existing project page using the new Reddit post.',
    'Return ONLY a JSON object with the changed fields and a "reason".',
    '',
    'Current page:',
    JSON.stringify(current, null, 2),
    '',
    'New post:',
    JSON.stringify(post, null, 2),
    '',
    'Repository (may be null):',
    JSON.stringify(repo, null, 2),
    '',
    'Latest release (may be null):',
    JSON.stringify(release, null, 2),
    '',
    'README (may be null):',
    readme ?? 'null',
  ].join('\n');
}

/**
 * Gather the research context for a post: resolve the repository from the
 * external URL (falling back to the title), then read its README and latest
 * release. Any missing piece is represented as `null`.
 */
export async function gatherUpdateContext(
  entry: ReportEntry,
  options: UpdateOptions = {},
): Promise<UpdateContext> {
  const repoOptions = options.repoOptions ?? {};
  const query = githubUrlFromEntry(entry) || entry.title;
  const repo = await searchRepository(query, repoOptions);
  if (repo === null) {
    return { repo: null, readme: null, release: null };
  }
  const readme = await readRepositoryReadme(repo.owner, repo.repo, repoOptions);
  const release = await getLatestRelease(repo.owner, repo.repo, repoOptions);
  return { repo, readme, release };
}

/**
 * Apply a patch to an existing page. Only the fields present in the patch are
 * replaced; everything else is preserved from the current page, including
 * custom sections, unknown frontmatter keys and existing media. The returned
 * `changed` list contains the names of the fields that actually differ.
 */
export function applyPatch(
  page: ContentPage,
  patch: UpdatePatch,
  entry: ReportEntry,
  context: UpdateContext,
  now: Date,
): AppliedPatch {
  const data = page.frontmatter;
  const changed: string[] = [];
  const repoUrl = context.repo?.htmlUrl ?? null;

  const title = pickChanged(
    'title',
    patch.title,
    readString(data, 'title', ''),
    changed,
  );
  const description = pickChanged(
    'description',
    patch.description,
    readString(data, 'description', ''),
    changed,
  );
  const category = pickChanged(
    'category',
    patch.category,
    readString(data, 'category', ''),
    changed,
  );

  const currentBody = parsePageBody(page.content);
  let sections = currentBody.sections;
  if (patch.sections !== undefined) {
    const nextSections: PageSection[] = patch.sections.map((section) => {
      const heading = section.heading.trim();
      return {
        heading,
        body: normalizeReleaseLinks(
          normalizeSectionBody(section.body, heading),
          repoUrl,
        ),
      };
    });
    if (!sameSections(currentBody.sections, nextSections)) {
      changed.push('sections');
    }
    sections = nextSections;
  }

  const currentMedia = readMedia(data);
  let mediaItems = currentMedia;
  let mediaPlan: MediaPlanItem[] = [];
  if (patch.media !== undefined) {
    const urls = selectImages(
      entry.images,
      patch.media,
      MEDIA_LIMITS.maxImagesHard,
    );
    const nextItems: MediaItem[] = urls.map((_url, index) => ({
      type: 'image',
      url: `/content/${page.slug}/${mediaFileName(index + 1)}`,
    }));
    // The page stores only the local file paths, so a different source image
    // can map onto the same path. Any explicit media selection is therefore
    // treated as a change and re-downloaded.
    changed.push('media');
    mediaItems = nextItems;
    mediaPlan = urls.map((url, index) => ({
      url,
      fileName: mediaFileName(index + 1),
    }));
  }

  const resolvedProjectUrl = resolveProjectUrl(
    context.repo?.htmlUrl ?? null,
    patch.project_url,
    entry,
  );
  const projectUrl =
    resolvedProjectUrl !== '' ? resolvedProjectUrl : currentBody.projectUrl;
  const sourceUrl =
    currentBody.sourceUrl !== '' ? currentBody.sourceUrl : entry.permalink;
  const date = readString(data, 'date', formatPageDate(now));

  const pageInput: PageInput = {
    frontmatter: {
      title,
      description,
      date,
      slug: page.slug,
      category,
      media: mediaItems,
    },
    sections: {
      sourceUrl,
      sections,
      projectUrl,
    },
    extraFrontmatter: readExtraFrontmatter(data),
  };

  return { page: pageInput, media: mediaPlan, changed };
}

/** Resolve the language model used by the update agent. */
function resolveUpdateModel(options: UpdateOptions): LanguageModel {
  if (options.model !== undefined) {
    return options.model;
  }
  const provider = createProvider(options.provider ?? {});
  return provider(resolveModel('update'));
}

/** Update an existing project page from a new post. */
export async function updatePage(
  page: ContentPage,
  entry: ReportEntry,
  options: UpdateOptions = {},
): Promise<UpdateResult> {
  const context = options.context ?? (await gatherUpdateContext(entry, options));
  const model = resolveUpdateModel(options);

  const patch = await generateStructured({
    model,
    schema: updatePatchSchema,
    system: UPDATE_SYSTEM_PROMPT,
    prompt: buildUpdatePrompt(page, entry, context),
    temperature: 0,
    schemaName: 'update_patch',
    schemaDescription:
      'Object with only the changed page fields and a required reason',
    agent: 'update',
    ...(options.generate !== undefined ? { generate: options.generate } : {}),
    ...(options.maxRepairAttempts !== undefined
      ? { maxRepairAttempts: options.maxRepairAttempts }
      : {}),
  });

  const applied = applyPatch(
    page,
    patch,
    entry,
    context,
    options.now ?? new Date(),
  );

  return {
    slug: page.slug,
    patch,
    context,
    page: applied.page,
    markdown: renderPage(applied.page),
    media: applied.media,
    changed: applied.changed,
  };
}
