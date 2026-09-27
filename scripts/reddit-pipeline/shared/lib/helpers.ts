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

/**
 * Turn a repository name into a human-readable project name.
 * Splits camelCase boundaries and separators, e.g. `PixelNavigator` →
 * `Pixel Navigator`, `goldeneye-007-recomp` → `goldeneye 007 recomp`.
 */
export function humanizeRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Force the `http` scheme of a URL to `https`; other URLs are unchanged. */
export function normalizeUrlScheme(url: string): string {
  return url.startsWith('http://')
    ? `https://${url.slice('http://'.length)}`
    : url;
}

/**
 * Human-friendly label for the project link, derived from the URL host.
 * Well-known hosts (GitHub, GitLab, Google Play, itch.io) get a stable label;
 * any other host falls back to its hostname.
 */
export function projectLinkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'github.com' || host.endsWith('.github.com')) {
      return 'github.com';
    }
    if (host === 'gitlab.com' || host.endsWith('.gitlab.com')) {
      return 'gitlab.com';
    }
    if (host === 'play.google.com') {
      return 'play.google.com';
    }
    if (host === 'itch.io' || host.endsWith('.itch.io')) {
      return 'itch.io';
    }
    return host;
  } catch {
    return 'project page';
  }
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

/** Trailing markdown/punctuation characters to strip from an extracted URL. */
const TRAILING_MARKDOWN_RE = /[.,;:*_~`'"!?]+$/;

/**
 * Remove the backslashes a model (or a Reddit export) added before markdown
 * special characters. Models routinely escape `_`, `*`, `[`, `]`, `(` and `)`
 * inside URLs (e.g. `super\_metroid`), which breaks link handling and GitHub
 * lookups once the value is reused outside of markdown.
 */
export function stripMarkdownEscapes(text: string): string {
  return text.replace(/\\([_*[\]()])/g, '$1');
}

/** Matches a GitHub web URL inside arbitrary text. */
const GITHUB_URL_RE = /https?:\/\/github\.com\/[^\s)\]]+/gi;

/** All GitHub URLs found in the given text (unescaped, de-duplicated). */
export function githubUrls(text: string): string[] {
  const unescaped = stripMarkdownEscapes(text);
  const matches = unescaped.match(GITHUB_URL_RE) ?? [];
  return unique(matches.map((url) => url.replace(TRAILING_MARKDOWN_RE, '')));
}

/**
 * All GitHub URLs of a post (external URL first, then the body), de-duplicated.
 * When a post links several repositories (e.g. an upstream project and a fork
 * for the AYN Thor), every candidate is returned so the caller can pick one.
 */
export function githubUrlsFromEntry(entry: ReportEntry): string[] {
  return unique([
    ...githubUrls(entry.external_url),
    ...githubUrls(entry.selftext),
  ]);
}

/**
 * First GitHub URL of a post (external URL or body), or `''`.
 * Used as a fallback when the full candidate list is not needed.
 */
export function githubUrlFromEntry(entry: ReportEntry): string {
  return githubUrlsFromEntry(entry)[0] ?? '';
}

/**
 * Deterministic fallback for the project URL of a post: the external URL when
 * it is a real project link (not an image), otherwise `''`.
 *
 * Image posts carry an image URL in `external_url`, which must never be used
 * as the project link.
 */
export function projectUrlFromEntry(entry: ReportEntry): string {
  return isProjectUrl(entry.external_url)
    ? normalizeUrlScheme(entry.external_url)
    : '';
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
    return normalizeUrlScheme(repoUrl);
  }
  if (candidate !== undefined && isProjectUrl(candidate)) {
    return normalizeUrlScheme(candidate);
  }
  return projectUrlFromEntry(entry);
}
