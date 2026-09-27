import {
  ARCTIC_SHIFT_API,
  ARCTIC_SHIFT_IDS_API,
  PULLPUSH_API,
  REDDIT_RSS_POST_API,
  REDDIT_RSS_SUB_API,
  REDDIT_USER_AGENT,
} from '../../../shared/lib/constants';
import { FetchError } from '../../../shared/lib/errors';
import { sleep } from '../../../shared/lib/helpers';
import { retry } from '../../../shared/lib/retry';
import { parseAtomFeed } from './rss';
import {
  redditResponseSchema,
  type FetchWindow,
  type RedditResponse,
} from './types';
import type { RawPost } from '../../../shared/lib/types';

/** Number of posts requested per page. */
const PAGE_SIZE = 100;

/** Total attempts per HTTP request. */
const HTTP_RETRIES = 3;

/** Base backoff delay (ms) for transient failures. */
const HTTP_BASE_DELAY_MS = 3000;

/** Backoff delay (ms) for HTTP 429 responses. */
const HTTP_RATE_LIMIT_DELAY_MS = 10000;

/** Polite pause (ms) between paginated requests. */
const POLITE_DELAY_MS = 1000;

/** Total attempts for the aggressively rate-limited Reddit Atom feed. */
const RSS_RETRIES = 3;

/**
 * Backoff delay (ms) for HTTP 429 from the Reddit Atom feed. Reddit allows
 * roughly one feed request per minute per IP, so the first retry waits ~60s.
 */
const RSS_RATE_LIMIT_DELAY_MS = 60000;

/** Options overriding the default retry/backoff behaviour. */
interface HttpGetOptions {
  retries?: number;
  rateLimitDelayMs?: number;
}

/** Extra buffer (ms) added on top of a server-suggested retry delay. */
const RETRY_AFTER_BUFFER_MS = 2000;

/** Read a server-suggested retry delay (ms) from rate-limit headers. */
function retryAfterFromHeaders(response: Response): number | undefined {
  for (const header of ['retry-after', 'x-ratelimit-reset']) {
    const value = response.headers.get(header);
    if (value === null) {
      continue;
    }
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds * 1000 + RETRY_AFTER_BUFFER_MS;
    }
  }
  return undefined;
}

/** GET a URL, retrying with backoff on failure. */
async function httpGet(
  url: string,
  options: HttpGetOptions = {},
): Promise<Response> {
  return await retry(
    async () => {
      const response = await fetch(url, {
        headers: { 'User-Agent': REDDIT_USER_AGENT },
      });
      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status} for ${url}`,
          url,
          response.status,
          retryAfterFromHeaders(response),
        );
      }
      return response;
    },
    {
      retries: options.retries ?? HTTP_RETRIES,
      baseDelayMs: HTTP_BASE_DELAY_MS,
      rateLimitDelayMs: options.rateLimitDelayMs ?? HTTP_RATE_LIMIT_DELAY_MS,
      isRateLimit: (error) =>
        error instanceof FetchError && error.status === 429,
    },
  );
}

/** GET a JSON document, retrying with backoff on failure. */
async function httpGetJson(url: string): Promise<RedditResponse> {
  const response = await httpGet(url);
  const json: unknown = await response.json();
  return redditResponseSchema.parse(json);
}

/** GET a text (Atom/XML) document, retrying with backoff on failure. */
async function httpGetText(url: string): Promise<string> {
  const response = await httpGet(url, {
    retries: RSS_RETRIES,
    rateLimitDelayMs: RSS_RATE_LIMIT_DELAY_MS,
  });
  return await response.text();
}

/** Build an arctic-shift search URL for the given cursor. */
export function arcticShiftUrl(window: FetchWindow, cursor: number): string {
  const params = new URLSearchParams({
    subreddit: window.subreddit,
    after: String(cursor),
    before: String(window.before),
    limit: String(PAGE_SIZE),
    sort: 'asc',
  });
  return `${ARCTIC_SHIFT_API}?${params.toString()}`;
}

/** Build a pullpush search URL for the given cursor. */
export function pullpushUrl(window: FetchWindow, cursor: number): string {
  const params = new URLSearchParams({
    subreddit: window.subreddit,
    after: String(cursor),
    before: String(window.before),
    size: String(PAGE_SIZE),
    sort: 'asc',
    sort_type: 'created_utc',
  });
  return `${PULLPUSH_API}?${params.toString()}`;
}

/** Fetch all posts in the window, paginating forward by `created_utc`. */
export async function paginate(
  window: FetchWindow,
  buildUrl: (cursor: number) => string,
): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  let cursor = window.after;
  for (;;) {
    const response = await httpGetJson(buildUrl(cursor));
    const data = response.data;
    if (data.length === 0) {
      break;
    }
    posts.push(...data);
    if (data.length < PAGE_SIZE) {
      break;
    }
    cursor = Math.max(...data.map((post) => post.created_utc));
    if (cursor >= window.before - 1) {
      break;
    }
    await sleep(POLITE_DELAY_MS);
  }
  return posts;
}

/** Build an arctic-shift URL returning the given post ids. */
export function arcticShiftIdsUrl(ids: readonly string[]): string {
  const params = new URLSearchParams({ ids: ids.join(',') });
  return `${ARCTIC_SHIFT_IDS_API}?${params.toString()}`;
}

/** Build a pullpush URL returning the given post ids. */
export function pullpushIdsUrl(ids: readonly string[]): string {
  const params = new URLSearchParams({ ids: ids.join(',') });
  return `${PULLPUSH_API}?${params.toString()}`;
}

/** Build the Reddit Atom feed URL for a single post (no subreddit needed). */
export function redditRssPostUrl(id: string): string {
  return `${REDDIT_RSS_POST_API}/${id}/.rss`;
}

/** Build the Reddit Atom feed URL for a subreddit's newest posts. */
export function redditRssSubUrl(subreddit: string): string {
  return `${REDDIT_RSS_SUB_API}/${subreddit}/new/.rss`;
}

/** Extract the post id from a Reddit permalink; `null` when absent. */
export function parsePostId(url: string): string | null {
  return /\/comments\/([^/]+)/.exec(url)?.[1] ?? null;
}

/** Fetch a single post from the Reddit Atom feed; `null` when absent. */
export async function fetchPostByIdRss(id: string): Promise<RawPost | null> {
  const xml = await httpGetText(redditRssPostUrl(id));
  return parseAtomFeed(xml)[0] ?? null;
}

/** Fetch the newest subreddit posts from the Reddit Atom feed. */
export async function fetchPostsRss(window: FetchWindow): Promise<RawPost[]> {
  const xml = await httpGetText(redditRssSubUrl(window.subreddit));
  return parseAtomFeed(xml).filter(
    (post) =>
      post.created_utc >= window.after && post.created_utc <= window.before,
  );
}

/**
 * Fetch a single post by id; `null` when the post is not found.
 *
 * Tries arctic-shift, then pullpush, then the Reddit Atom feed. pullpush lags
 * behind on very fresh posts and the Atom feed only exposes the newest posts,
 * so a `null` result may simply mean the post is not indexed yet.
 */
export async function fetchPostById(id: string): Promise<RawPost | null> {
  const sources: readonly {
    name: string;
    load: () => Promise<RawPost | null>;
  }[] = [
    {
      name: 'arctic-shift',
      load: async () => (await httpGetJson(arcticShiftIdsUrl([id]))).data[0] ?? null,
    },
    {
      name: 'pullpush',
      load: async () => (await httpGetJson(pullpushIdsUrl([id]))).data[0] ?? null,
    },
    { name: 'rss', load: async () => await fetchPostByIdRss(id) },
  ];

  for (const source of sources) {
    try {
      const post = await source.load();
      if (post) {
        return post;
      }
    } catch (error) {
      console.warn(`${source.name} failed (${String(error)}), trying next…`);
    }
  }
  return null;
}
