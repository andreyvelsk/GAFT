import type { LanguageModel } from 'ai';

import { mediaFileName, selectImages } from '../../../content/media';
import {
  CATEGORY_PROMPT_GUIDE,
  normalizeReleaseLinks,
  normalizeSectionBody,
  renderPage,
  type MediaItem,
  type PageInput,
  type PageSection,
} from '../../../content/template';
import {
  getRepo,
  normalizeName,
  parseRepoRef,
  type GitHubRepo,
  type RepoOptions,
} from '../../../github/repo';
import {
  formatPageDate,
  githubUrlFromEntry,
  githubUrlsFromEntry,
  humanizeRepoName,
  kebabCase,
  repoSearchQueries,
  resolveProjectUrl,
  stripMarkdownEscapes,
} from '../../../shared/lib/helpers';
import { createLogger } from '../../../shared/lib/logger';
import type { ReportEntry } from '../../../shared/lib/types';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import {
  loadContentIndex,
  matchCandidates,
  type ContentCandidate,
} from '../../../tools/content-search';
import { getLatestRelease } from '../../../tools/github-release';
import { readRepositoryReadme } from '../../../tools/github-readme';
import { searchRepository } from '../../../tools/github-search';
import {
  createDraftSchema,
  type BuildCreatePageInputArgs,
  type CreateContext,
  type CreateDraft,
  type CreateOptions,
  type CreateResult,
  type MediaPlanItem,
} from './types';

/**
 * Maximum number of `selftext` characters forwarded to the model.
 * Long release posts (feature lists, changelogs) routinely exceed 10k
 * characters; truncating them too aggressively yields a thin page.
 */
const MAX_SELFTEXT_LENGTH = 10000;

/** Maximum number of README characters forwarded to the model. */
const MAX_README_LENGTH = 12000;

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
  '- "title": the PROJECT NAME (e.g. "GoldenEye 007", "DOOM (1993)"), never the',
  '  Reddit post title. When a repository is provided, take the name from the',
  '  repository or its README.',
  '- "description": ONE short sentence for the page frontmatter. It is a summary',
  '  only — do NOT repeat the "Description" section text. The "ONE short',
  '  sentence" rule applies to this frontmatter field only: inside the page',
  '  sections write as much detail as the post and README support — do not',
  '  compress a rich project into a couple of lines.',
  '- "category": exactly one of the following project categories:',
  CATEGORY_PROMPT_GUIDE,
  '- "slug": a kebab-case slug derived from the project name (not the post title).',
  '- "project_url": the canonical link to the project (repository, store page',
  '  or official site) taken from the post or README. Omit it when there is no',
  '  such link.',
  '- "sections": an ordered array of {"heading", "body"} objects. "Description"',
  '  and "Setup guide" are REQUIRED. Add at most two extra sections (e.g.',
  '  "Features", "Known issues") only when the project needs them — never',
  '  more than 4 sections in total. Each "body" must contain ONLY',
  '  the section text — no "## …" heading, no "source:" line and no project link.',
  '- "media": an array of image URLs chosen from the provided post images.',
  '',
  'Write for the END USER who wants to use the project, never for its',
  'developer. Do NOT include build or development instructions (compilers,',
  'SDKs, NDK, gradle, adb, source compilation, repository setup) or internal',
  'implementation details. The "Setup guide" section must contain only',
  'user-facing installation and usage steps; when the post or README has no',
  'detailed user guide, keep it short — tell the reader to download and install',
  'the latest release.',
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
  const candidates = (context.candidates ?? []).map((item) => ({
    fullName: item.fullName,
    htmlUrl: item.htmlUrl,
    description: item.description,
  }));
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
 * Pick the repository that targets the AYN Thor when a post links several
 * (e.g. an upstream project and a dual-screen fork). Its description and README
 * are scored for dual-screen/Thor keywords; ties keep the original order, so
 * the link from the post body wins. The README read while scoring is returned
 * so it is not fetched twice.
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
export async function gatherCreateContext(
  entry: ReportEntry,
  options: CreateOptions = {},
): Promise<CreateContext> {
  const repoOptions = options.repoOptions ?? {};
  const query = githubUrlFromEntry(entry) || entry.title;
  const log = options.logger ?? createLogger();
  try {
    log.debug('create: researching repositories', { id: entry.id, query });
    const repos = await resolveCandidateRepos(entry, repoOptions);
    if (repos.length === 0) {
      log.info('create: no repository found', { id: entry.id, query });
      return { repo: null, readme: null, release: null };
    }
    const preferred = await pickPreferredRepo(repos, repoOptions);
    if (preferred === null) {
      return { repo: null, readme: null, release: null };
    }
    log.debug('create: fetching latest release', {
      repo: preferred.repo.fullName,
    });
    const release = await getLatestRelease(
      preferred.repo.owner,
      preferred.repo.repo,
      repoOptions,
    );
    log.info('create: repository research done', {
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
    log.warn('create: repository research failed', {
      id: entry.id,
      query,
      error: String(error),
    });
    return { repo: null, readme: null, release: null };
  }
}

/**
 * Resolve the page title. The model is asked for the project name, but when it
 * merely echoes the Reddit post title (or returns nothing) the repository name
 * is used instead, so the page is named after the project, not the post.
 */
export function resolveTitle(
  entry: ReportEntry,
  draft: CreateDraft,
  context: CreateContext,
): string {
  const draftTitle = draft.title.trim();
  const repoName =
    context.repo === null ? '' : humanizeRepoName(context.repo.repo);
  const echoesPostTitle =
    draftTitle !== '' &&
    normalizeName(draftTitle) === normalizeName(entry.title);

  if (draftTitle !== '' && !echoesPostTitle) {
    return draftTitle;
  }
  if (repoName !== '') {
    return repoName;
  }
  return draftTitle !== '' ? draftTitle : entry.title;
}

/** Options accepted by {@link resolveSlug}. */
export interface ResolveSlugOptions {
  /** Pre-loaded content index (used by tests). */
  contentIndex?: readonly ContentCandidate[];

  /** Content directory override. */
  contentDir?: string;

  /** Query used to find an existing page (e.g. the repository URL). */
  query?: string;
}

/**
 * Resolve the page slug. An existing page matching the repository URL or the
 * project title is reused (so a project never gets a duplicate page); otherwise
 * a new kebab-case slug is derived from the draft slug or the post title.
 */
export async function resolveSlug(
  entry: ReportEntry,
  draft: CreateDraft,
  options: ResolveSlugOptions = {},
): Promise<string> {
  const candidate = draft.slug.trim() === '' ? entry.title : draft.slug;
  const fallback = kebabCase(candidate);
  const index = await loadContentIndex({
    ...(options.contentIndex !== undefined
      ? { index: options.contentIndex }
      : {}),
    ...(options.contentDir !== undefined
      ? { contentDir: options.contentDir }
      : {}),
  });

  for (const query of [options.query ?? '', draft.title, entry.title]) {
    const match = matchCandidates(query, index)[0];
    if (match !== undefined) {
      return match.slug;
    }
  }
  return fallback;
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
  if (entry.video_url !== undefined && entry.video_url !== '') {
    media.push({ type: 'video', url: entry.video_url });
  }
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
      title: resolveTitle(entry, draft, context),
      description: draft.description.trim(),
      date: formatPageDate(now),
      slug,
      category: draft.category,
      media,
    },
    sections: {
      sourceUrl: entry.permalink,
      sections,
      projectUrl,
    },
  };
}

/**
 * Remove the markdown backslash-escapes a model adds to URLs and text, so an
 * escaped underscore (e.g. `super\_metroid`) never reaches the frontmatter,
 * the slug or the GitHub lookup.
 */
export function sanitizeCreateDraft(draft: CreateDraft): CreateDraft {
  return {
    ...draft,
    title: stripMarkdownEscapes(draft.title),
    description: stripMarkdownEscapes(draft.description),
    slug: stripMarkdownEscapes(draft.slug),
    ...(draft.project_url !== undefined
      ? { project_url: stripMarkdownEscapes(draft.project_url) }
      : {}),
    sections: draft.sections.map((section) => ({
      heading: stripMarkdownEscapes(section.heading),
      body: stripMarkdownEscapes(section.body),
    })),
    media: draft.media.map((url) => stripMarkdownEscapes(url)),
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

  const rawDraft = await generateStructured({
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
  const draft = sanitizeCreateDraft(rawDraft);

  const slug = await resolveSlug(entry, draft, {
    ...(options.contentIndex !== undefined
      ? { contentIndex: options.contentIndex }
      : {}),
    ...(options.contentDir !== undefined
      ? { contentDir: options.contentDir }
      : {}),
    query: context.repo?.htmlUrl ?? '',
  });
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
