import type { ReportEntry } from './types';

/** Resolve after the given number of milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Split an array into consecutive chunks of at most `size` items. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) {
    throw new RangeError('chunk size must be greater than 0');
  }
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

/** Remove duplicates while preserving the original order. */
export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/** Type guard for a non-empty (after trimming) string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Convert an arbitrary label into a kebab-case slug. */
export function kebabCase(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** File name of the n-th screenshot (1-based index). */
export function screenshotFileName(index: number): string {
  return `screenshot-${index}.webp`;
}

/** Current time as a Unix timestamp in seconds. */
export function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** Format a date as the page frontmatter timestamp (`YYYY-MM-DD HH:mm`, UTC). */
export function formatPageDate(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  return `${day} ${time}`;
}

/** Hosts that serve post images rather than project pages. */
const IMAGE_HOST_RE = /(^|\.)(i\.redd\.it|preview\.redd\.it|i\.imgur\.com)$/i;

/** Image file extensions. */
const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|avif)$/i;

/** Whether a URL points at an image rather than a project page. */
export function isImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      IMAGE_HOST_RE.test(parsed.hostname) || IMAGE_EXT_RE.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

/** Whether a URL is a usable project link (http(s) and not an image). */
export function isProjectUrl(url: string): boolean {
  if (url === '') {
    return false;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return !isImageUrl(url);
  } catch {
    return false;
  }
}

/** First GitHub URL found in the given text, or `''`. */
function firstGitHubUrl(text: string): string {
  const match = /https?:\/\/github\.com\/[^\s)\]]+/i.exec(text);
  return match?.[0]?.replace(/[.,;:]+$/, '') ?? '';
}

/**
 * First GitHub URL of a post (external URL or body), or `''`.
 * Used to locate the repository for README/release research.
 */
export function githubUrlFromEntry(entry: ReportEntry): string {
  const fromExternal = firstGitHubUrl(entry.external_url);
  if (fromExternal !== '') {
    return fromExternal;
  }
  return firstGitHubUrl(entry.selftext);
}

/**
 * Deterministic fallback for the project URL of a post: the external URL when
 * it is a real project link (not an image), otherwise `''`.
 *
 * Image posts carry an image URL in `external_url`, which must never be used
 * as the project link.
 */
export function projectUrlFromEntry(entry: ReportEntry): string {
  return isProjectUrl(entry.external_url) ? entry.external_url : '';
}

/**
 * Resolve the canonical project URL of a page, in order of precedence:
 * the resolved repository URL, the model-provided URL (when valid), the
 * deterministic fallback from the post.
 */
export function resolveProjectUrl(
  repoUrl: string | null,
  candidate: string | undefined,
  entry: ReportEntry,
): string {
  if (repoUrl !== null && repoUrl !== '') {
    return repoUrl;
  }
  if (candidate !== undefined && isProjectUrl(candidate)) {
    return candidate;
  }
  return projectUrlFromEntry(entry);
}
