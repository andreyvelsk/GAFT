import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { FrontmatterData } from '../../../content/frontmatter';
import {
  mediaFileName,
  selectImages,
  type MediaPlanItem,
} from '../../../content/media';
import {
  CATEGORY_PROMPT_GUIDE,
  isPageCategory,
  mediaItemSchema,
  normalizeReleaseLinks,
  normalizeSectionBody,
  parsePageBody,
  renderPage,
  type MediaItem,
  type PageCategory,
  type PageInput,
  type PageSection,
} from '../../../content/template';
import {
  getRepo,
  parseRepoRef,
  type GitHubRepo,
  type RepoOptions,
} from '../../../github/repo';
import { MEDIA_LIMITS } from '../../../shared/lib/constants';
import {
  formatPageDate,
  githubUrlFromEntry,
  githubUrlsFromEntry,
  repoSearchQueries,
  resolveProjectUrl,
  stripMarkdownEscapes,
} from '../../../shared/lib/helpers';
import { createLogger } from '../../../shared/lib/logger';
import type { ReportEntry } from '../../../shared/lib/types';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import type { ContentPage } from '../../../tools/content-read';
import { getLatestRelease } from '../../../tools/github-release';
import { readRepositoryReadme } from '../../../tools/github-readme';
import { searchRepository } from '../../../tools/github-search';
import {
  updatePatchSchema,
  type AppliedPatch,
  type UpdateAgent,
  type UpdateAgentOptions,
  type UpdateContext,
  type UpdateOptions,
  type UpdatePatch,
  type UpdateResult,
} from './types';

/**
 * Maximum number of `selftext` characters forwarded to the model.
 * `0` disables truncation and forwards the full text.
 */
const MAX_SELFTEXT_LENGTH = 0;

/**
 * Maximum number of README characters forwarded to the model.
 * `0` disables truncation and forwards the full text.
 */
const MAX_README_LENGTH = 0;

/**
 * Maximum number of current-page body characters forwarded to the model.
 * `0` disables truncation and forwards the full text.
 */
const MAX_BODY_LENGTH = 0;

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
  '- "title": the PROJECT NAME (never the Reddit post title).',
  '- "description": ONE short sentence for the frontmatter — a summary only,',
  '  do NOT repeat the "Description" section text. The "ONE short sentence"',
  '  rule applies to this frontmatter field only: inside the page sections write',
  '  as much detail as the sources support.',
  '- "category": exactly one of the following project categories:',
  CATEGORY_PROMPT_GUIDE,
  '- "media": an array of image URLs from the post.',
  '- "project_url": the canonical link to the project (repository, store page',
  '  or official site), when it changes.',
  '- "sections": the FULL ordered array of {"heading", "body"} objects when the',
  '  page structure or any section changes. Include ALL sections (not only the',
  '  changed ones); "Description" and "Setup guide" are REQUIRED and there must',
  '  be at most 4 sections. Each "body" must contain ONLY the section text — no',
  '  "## …" heading, no "source:" line and no project link.',
  '- Include a field only when it actually changes; omit unchanged fields.',
  '- Always include "reason": a short English sentence explaining the update.',
  '',
  'Write for the END USER who wants to use the project, never for its',
  'developer. Do NOT include build or development instructions (compilers,',
  'SDKs, NDK, gradle, adb, source compilation, repository setup) or internal',
  'implementation details. The "Setup guide" section must contain only',
  'user-facing installation and usage steps; when there is no detailed user',
  'guide, keep it short — tell the reader to download and install the latest',
  'release.',
  '',
  'Write in English only. When you mention a release, link to the latest',
  'release (the provided release URL ends with "/releases/latest").',
].join('\n');

/**
 * Truncate a string to `max` characters, appending an ellipsis when cut.
 * A non-positive `max` disables truncation and returns the text unchanged.
 */
function truncate(text: string, max: number): string {
  return max <= 0 || text.length <= max ? text : `${text.slice(0, max - 1)}…`;
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

/**
 * Read the category of an existing page, validating it against the controlled
 * vocabulary. Throws when the page carries an unknown category so bad data is
 * surfaced rather than silently rewritten.
 */
function readCategory(data: FrontmatterData): PageCategory {
  const value = data.category;
  if (!isPageCategory(value)) {
    throw new Error(`invalid page category: ${String(value)}`);
  }
  return value;
}

/** Return the next value, recording the field name when it actually changes. */
function pickChanged<T>(
  name: string,
  next: T | undefined,
  current: T,
  changed: string[],
): T {
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
  const candidates = (context.candidates ?? []).map((item) => ({
    fullName: item.fullName,
    htmlUrl: item.htmlUrl,
    description: item.description,
  }));
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
    'Repository candidates from the post (the AYN Thor target is preferred):',
    JSON.stringify(candidates, null, 2),
    '',
    'Latest release (may be null):',
    JSON.stringify(release, null, 2),
    '',
    'README (may be null):',
    readme ?? 'null',
  ].join('\n');
}

/** Keywords that mark a repository as targeted at the dual-screen device. */
const DUAL_SCREEN_RE =
  /(second screen|dual[\s-]?screen|two screens|top screen|bottom screen|ayn thor|\bthor\b)/i;

/** Resolve every repository linked from a post (best effort, never throws). */
async function resolveCandidateRepos(
  entry: ReportEntry,
  repoOptions: RepoOptions,
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  for (const url of githubUrlsFromEntry(entry)) {
    const ref = parseRepoRef(url);
    if (ref === null) {
      continue;
    }
    try {
      repos.push(await getRepo(ref.owner, ref.repo, repoOptions));
    } catch {
      // A broken or private link must not abort the whole research.
    }
  }
  if (repos.length === 0) {
    // No link in the post (or the body was removed): fall back to a name
    // search. The full Reddit title never matches a repository name, so short
    // queries derived from it are tried from the most to the least specific.
    const queries = [
      githubUrlFromEntry(entry),
      ...repoSearchQueries(entry.title),
      entry.title,
    ].filter((query) => query !== '');
    for (const query of queries) {
      const repo = await searchRepository(query, repoOptions);
      if (repo !== null) {
        repos.push(repo);
        break;
      }
    }
  }
  return repos;
}

/** Read a README without letting a transient error abort the research. */
async function readReadmeSafe(
  repo: GitHubRepo,
  repoOptions: RepoOptions,
): Promise<string | null> {
  try {
    return await readRepositoryReadme(repo.owner, repo.repo, repoOptions);
  } catch {
    return null;
  }
}

/** Score a repository as the AYN Thor target from its description + README. */
function dualScreenScore(repo: GitHubRepo, readme: string | null): number {
  let score = 0;
  if (DUAL_SCREEN_RE.test(repo.description)) {
    score += 2;
  }
  if (readme !== null && DUAL_SCREEN_RE.test(readme)) {
    score += 3;
  }
  if (readme !== null && /\bfork\b/i.test(readme)) {
    score += 1;
  }
  return score;
}

/**
 * Pick the repository that targets the AYN Thor when a post links several.
 * Its description and README are scored for dual-screen/Thor keywords; ties
 * keep the original order, so the link from the post body wins.
 */
async function pickPreferredRepo(
  repos: readonly GitHubRepo[],
  repoOptions: RepoOptions,
): Promise<{ repo: GitHubRepo; readme: string | null } | null> {
  let best: { repo: GitHubRepo; readme: string | null; score: number } | null =
    null;
  for (const repo of repos) {
    const readme = await readReadmeSafe(repo, repoOptions);
    const score = dualScreenScore(repo, readme);
    if (best === null || score > best.score) {
      best = { repo, readme, score };
    }
  }
  return best === null ? null : { repo: best.repo, readme: best.readme };
}

/**
 * Gather the research context for a post. Every GitHub link of the post is
 * resolved, the repository that targets the AYN Thor is selected from the
 * candidates, and its README and latest release are read. Any missing piece is
 * represented as `null`.
 */
export async function gatherUpdateContext(
  entry: ReportEntry,
  options: UpdateOptions = {},
): Promise<UpdateContext> {
  const repoOptions = options.repoOptions ?? {};
  const query = githubUrlFromEntry(entry) || entry.title;
  const log = options.logger ?? createLogger();
  try {
    log.debug('update: researching repositories', { id: entry.id, query });
    const repos = await resolveCandidateRepos(entry, repoOptions);
    if (repos.length === 0) {
      log.info('update: no repository found', { id: entry.id, query });
      return { repo: null, readme: null, release: null };
    }
    const preferred = await pickPreferredRepo(repos, repoOptions);
    if (preferred === null) {
      return { repo: null, readme: null, release: null };
    }
    log.debug('update: fetching latest release', {
      repo: preferred.repo.fullName,
    });
    const release = await getLatestRelease(
      preferred.repo.owner,
      preferred.repo.repo,
      repoOptions,
    );
    log.info('update: repository research done', {
      id: entry.id,
      repo: preferred.repo.fullName,
      hasReadme: preferred.readme !== null,
      release: release?.tagName ?? null,
    });
    return {
      repo: preferred.repo,
      readme: preferred.readme,
      release,
      candidates: repos,
    };
  } catch (error) {
    log.warn('update: repository research failed', {
      id: entry.id,
      query,
      error: String(error),
    });
    return { repo: null, readme: null, release: null };
  }
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
  const category = pickChanged<PageCategory>(
    'category',
    patch.category,
    readCategory(data),
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
  const currentVideos = currentMedia.filter((item) => item.type === 'video');
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
    // treated as a change and re-downloaded. Existing videos are preserved.
    changed.push('media');
    mediaItems = [...nextItems, ...currentVideos];
    mediaPlan = urls.map((url, index) => ({
      url,
      fileName: mediaFileName(index + 1),
    }));
  }
  if (
    entry.video_url !== undefined &&
    entry.video_url !== '' &&
    !mediaItems.some((item) => item.type === 'video')
  ) {
    mediaItems = [...mediaItems, { type: 'video', url: entry.video_url }];
    if (!changed.includes('media')) {
      changed.push('media');
    }
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

/**
 * Remove the markdown backslash-escapes a model adds to URLs and text, so an
 * escaped underscore (e.g. `super\_metroid`) never reaches the frontmatter or
 * the page body.
 */
export function sanitizeUpdatePatch(patch: UpdatePatch): UpdatePatch {
  return {
    ...patch,
    ...(patch.title !== undefined
      ? { title: stripMarkdownEscapes(patch.title) }
      : {}),
    ...(patch.description !== undefined
      ? { description: stripMarkdownEscapes(patch.description) }
      : {}),
    ...(patch.project_url !== undefined
      ? { project_url: stripMarkdownEscapes(patch.project_url) }
      : {}),
    ...(patch.sections !== undefined
      ? {
          sections: patch.sections.map((section) => ({
            heading: stripMarkdownEscapes(section.heading),
            body: stripMarkdownEscapes(section.body),
          })),
        }
      : {}),
    ...(patch.media !== undefined
      ? { media: patch.media.map((url) => stripMarkdownEscapes(url)) }
      : {}),
  };
}

/** Update an existing project page from a new post. */
export async function updatePage(
  page: ContentPage,
  entry: ReportEntry,
  options: UpdateOptions = {},
): Promise<UpdateResult> {
  const context = options.context ?? (await gatherUpdateContext(entry, options));
  const model = resolveUpdateModel(options);

  const rawPatch = await generateStructured({
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
  const patch = sanitizeUpdatePatch(rawPatch);

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

/**
 * Create the update agent. A thin wrapper over {@link updatePage} that keeps the
 * generation engine (LLM) as the only backend; agent-level options (the logger)
 * are merged with the per-call options, the per-call value taking precedence.
 */
export function createUpdateAgent(
  options: UpdateAgentOptions = {},
): UpdateAgent {
  return {
    updatePage(
      page: ContentPage,
      entry: ReportEntry,
      callOptions: UpdateOptions = {},
    ): Promise<UpdateResult> {
      return updatePage(page, entry, { ...options, ...callOptions });
    },
  };
}
