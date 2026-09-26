import type { LanguageModel } from 'ai';

import { mediaFileName, selectImages } from '../../../content/media';
import {
  normalizeReleaseLinks,
  normalizeSectionBody,
  renderPage,
  type MediaItem,
  type PageInput,
  type PageSection,
} from '../../../content/template';
import {
  formatPageDate,
  githubUrlFromEntry,
  kebabCase,
  resolveProjectUrl,
} from '../../../shared/lib/helpers';
import type { ReportEntry } from '../../../shared/lib/types';
import { resolveModel } from '../../model/lib/helpers';
import { createProvider, generateStructured } from '../../provider/lib/helpers';
import { getLatestRelease } from '../../tools/github-release';
import { readRepositoryReadme } from '../../tools/github-readme';
import { searchRepository } from '../../tools/github-search';
import {
  createDraftSchema,
  type BuildCreatePageInputArgs,
  type CreateContext,
  type CreateDraft,
  type CreateOptions,
  type CreateResult,
  type MediaPlanItem,
} from './types';

/** Maximum number of `selftext` characters forwarded to the model. */
const MAX_SELFTEXT_LENGTH = 1200;

/** Maximum number of README characters forwarded to the model. */
const MAX_README_LENGTH = 4000;

/** System prompt describing the page-generation task. */
export const CREATE_SYSTEM_PROMPT = [
  'You write a project page for a blog that lists projects (games, apps, ports,',
  'emulators, tools) built for the AYN Thor handheld with its two screens.',
  '',
  'You are given a Reddit post and, when available, the project repository, its',
  'README and its latest release. Use ONLY the provided facts — never invent',
  'features, versions, links or claims that are not present in the input.',
  '',
  'Return a JSON object with these fields:',
  '- "title": the project name (short, no marketing fluff).',
  '- "description": one or two sentences for the page frontmatter.',
  '- "category": one lowercase word, e.g. "game", "app", "port", "emulator", "tool".',
  '- "slug": a kebab-case slug derived from the project name.',
  '- "project_url": the canonical link to the project (repository, store page',
  '  or official site) taken from the post or README. Omit it when there is no',
  '  such link.',
  '- "sections": an ordered array of {"heading", "body"} objects. Use',
  '  "Description" and "Setup guide" as the standard headings, and add extra',
  '  sections (e.g. "Features", "Supported games", "Known issues") when the',
  '  project needs them. Each "body" must contain ONLY the section text — no',
  '  "## …" heading, no "source:" line and no project link.',
  '- "media": an array of image URLs chosen from the provided post images.',
  '',
  'Write in English only. When you mention a release or the repository release',
  'page, always link to the latest release (the provided release URL ends with',
  '"/releases/latest"). Do not include the source Reddit link or the project',
  'link in the body — they are added automatically.',
].join('\n');

/** Truncate a string to `max` characters, appending an ellipsis when cut. */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Build the user prompt for a post and its research context. */
export function buildCreatePrompt(
  entry: ReportEntry,
  context: CreateContext,
): string {
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
    'Write a project page for this Reddit post.',
    'Return ONLY a JSON object with the fields described in the system prompt.',
    '',
    'Post:',
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
export async function gatherCreateContext(
  entry: ReportEntry,
  options: CreateOptions = {},
): Promise<CreateContext> {
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

/** Resolve the page slug from the draft, falling back to the post title. */
export function resolveSlug(entry: ReportEntry, draft: CreateDraft): string {
  const candidate = draft.slug.trim() === '' ? entry.title : draft.slug;
  return kebabCase(candidate);
}

/** Build the media download plan for the selected image URLs. */
export function buildMediaPlan(urls: readonly string[]): MediaPlanItem[] {
  return urls.map((url, index) => ({
    url,
    fileName: mediaFileName(index + 1),
  }));
}

/** Build a validated page input from the draft and the research context. */
export function buildCreatePageInput(
  args: BuildCreatePageInputArgs,
): PageInput {
  const { draft, entry, context, mediaUrls, slug, now } = args;
  const repoUrl = context.repo?.htmlUrl ?? null;
  const media: MediaItem[] = mediaUrls.map((_url, index) => ({
    type: 'image',
    url: `/content/${slug}/${mediaFileName(index + 1)}`,
  }));
  const sections: PageSection[] = draft.sections.map((section) => {
    const heading = section.heading.trim();
    return {
      heading,
      body: normalizeReleaseLinks(
        normalizeSectionBody(section.body, heading),
        repoUrl,
      ),
    };
  });
  const projectUrl = resolveProjectUrl(
    context.repo?.htmlUrl ?? null,
    draft.project_url,
    entry,
  );

  return {
    frontmatter: {
      title: draft.title.trim(),
      description: draft.description.trim(),
      date: formatPageDate(now),
      slug,
      category: draft.category.trim(),
      media,
    },
    sections: {
      sourceUrl: entry.permalink,
      sections,
      projectUrl,
    },
  };
}

/** Resolve the language model used by the create agent. */
function resolveCreateModel(options: CreateOptions): LanguageModel {
  if (options.model !== undefined) {
    return options.model;
  }
  const provider = createProvider(options.provider ?? {});
  return provider(resolveModel('create'));
}

/** Generate a new project page for a post. */
export async function createPage(
  entry: ReportEntry,
  options: CreateOptions = {},
): Promise<CreateResult> {
  const context = options.context ?? (await gatherCreateContext(entry, options));
  const model = resolveCreateModel(options);

  const draft = await generateStructured({
    model,
    schema: createDraftSchema,
    system: CREATE_SYSTEM_PROMPT,
    prompt: buildCreatePrompt(entry, context),
    temperature: 0,
    schemaName: 'create_page',
    schemaDescription:
      'Object with title, description, category, slug, sections and media',
    agent: 'create',
    ...(options.generate !== undefined ? { generate: options.generate } : {}),
    ...(options.maxRepairAttempts !== undefined
      ? { maxRepairAttempts: options.maxRepairAttempts }
      : {}),
  });

  const slug = resolveSlug(entry, draft);
  const mediaUrls = selectImages(entry.images, draft.media);
  const page = buildCreatePageInput({
    draft,
    entry,
    context,
    mediaUrls,
    slug,
    now: options.now ?? new Date(),
  });

  return {
    slug,
    draft,
    context,
    page,
    markdown: renderPage(page),
    media: buildMediaPlan(mediaUrls),
  };
}
