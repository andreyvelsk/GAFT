import {
  ARCTIC_SHIFT_API,
  PULLPUSH_API,
  REDDIT_USER_AGENT,
} from '../../../shared/lib/constants';
import { FetchError } from '../../../shared/lib/errors';
import { sleep } from '../../../shared/lib/helpers';
import { retry } from '../../../shared/lib/retry';
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

/** GET a JSON document, retrying with backoff on failure. */
async function httpGetJson(url: string): Promise<RedditResponse> {
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
        );
      }
      const json: unknown = await response.json();
      return redditResponseSchema.parse(json);
    },
    {
      retries: HTTP_RETRIES,
      baseDelayMs: HTTP_BASE_DELAY_MS,
      rateLimitDelayMs: HTTP_RATE_LIMIT_DELAY_MS,
      isRateLimit: (error) =>
        error instanceof FetchError && error.status === 429,
    },
  );
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
