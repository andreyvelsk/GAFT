import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

/**
 * Absolute path to the repository root.
 * File lives at `scripts/reddit-pipeline/shared/lib/constants.ts`, so the root
 * is four levels up.
 */
export const PROJECT_ROOT = resolve(currentDir, '..', '..', '..', '..');

/** Directory with the blog pages (`content/<slug>/index.md`). */
export const CONTENT_DIR = join(PROJECT_ROOT, 'content');

/** Directory with the generated media (`public/content/<slug>/*.webp`). */
export const PUBLIC_CONTENT_DIR = join(PROJECT_ROOT, 'public', 'content');

/** Directory with the run reports. */
export const PLANS_DIR = join(PROJECT_ROOT, 'plans');

/** arctic-shift posts search endpoint (primary Reddit source). */
export const ARCTIC_SHIFT_API =
  'https://arctic-shift.photon-reddit.com/api/posts/search';

/** arctic-shift endpoint returning posts by id. */
export const ARCTIC_SHIFT_IDS_API =
  'https://arctic-shift.photon-reddit.com/api/posts/ids';

/** pullpush submissions endpoint (fallback Reddit source). */
export const PULLPUSH_API = 'https://api.pullpush.io/reddit/search/submission/';

/** GitHub REST API base URL. */
export const GITHUB_API = 'https://api.github.com';

/** User-Agent sent to the Reddit mirrors. */
export const REDDIT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

/** Media limits enforced before writing a page. */
export const MEDIA_LIMITS = {
  maxImages: 3,
  maxVideos: 1,
} as const;

/** File name of the first (preview) image of a page. */
export const PREVIEW_FILE_NAME = 'preview.webp';

/** Fallback models per agent (used when the matching env var is empty). */
export const DEFAULT_MODELS = {
  filter: '~deepseek/deepseek-v4-flash-latest',
  match: '~deepseek/deepseek-v4-flash-latest',
  create: '~deepseek/deepseek-v4-flash-latest',
  update: '~deepseek/deepseek-v4-flash-latest',
  fallback: '~deepseek/deepseek-v4-flash-latest',
} as const;

/** Default subreddit to scan. */
export const DEFAULT_SUBREDDIT = 'AynThor';

/** Default lookback window in hours. */
export const DEFAULT_LOOKBACK_HOURS = 24;

/** Default number of posts per LLM batch. */
export const DEFAULT_BATCH_SIZE = 10;

/** Default post limit per run (0 = unlimited). */
export const DEFAULT_MAX_POSTS = 0;

/** Default branch used to accumulate pipeline changes. */
export const DEFAULT_PR_BRANCH = 'reddit-pipeline/auto';

/** Default base branch for the pull request. */
export const DEFAULT_PR_BASE = 'main';

/** Default labels applied to the pull request. */
export const DEFAULT_PR_LABELS = ['automation', 'reddit'] as const;
