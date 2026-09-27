import type { z } from 'zod';

import { GITHUB_API } from '../../../shared/lib/constants';
import { FetchError } from '../../../shared/lib/errors';
import { sleep } from '../../../shared/lib/helpers';
import type {
  GitHubRequestOptions,
  GitHubRetrySettings,
} from './types';

/** Total attempts per request by default. */
const DEFAULT_RETRIES = 3;

/** Base backoff delay (ms) for transient failures. */
const DEFAULT_BASE_DELAY_MS = 1000;

/** Backoff delay (ms) for HTTP 429 responses. */
const DEFAULT_RATE_LIMIT_DELAY_MS = 5000;

/** User-Agent sent to the GitHub API. */
const GITHUB_USER_AGENT = 'reddit-pipeline';

/** Whether the missing-token warning has already been emitted this run. */
let missingTokenWarned = false;

/** Reset the one-time missing-token warning (used by tests). */
export function resetMissingTokenWarning(): void {
  missingTokenWarned = false;
}

/**
 * Warn once per run when no GitHub token is configured, so the degraded
 * (60 requests/hour) rate limit is explicit instead of silent.
 */
export function warnIfMissingToken(token: string): void {
  if (token !== '' || missingTokenWarned) {
    return;
  }
  missingTokenWarned = true;
  console.warn(
    'GITHUB_TOKEN is not set: GitHub API requests are limited to 60/hour. ' +
      'Set a personal access token to raise the limit.',
  );
}

/** Pinned GitHub REST API version. */
const GITHUB_API_VERSION = '2022-11-28';

/** Media type for JSON responses. */
const JSON_ACCEPT = 'application/vnd.github+json';

/** Media type returning the raw file body (used for READMEs). */
const RAW_ACCEPT = 'application/vnd.github.raw+json';

/** Resolve the retry settings from the request options. */
export function resolveRetrySettings(
  options: GitHubRequestOptions,
): GitHubRetrySettings {
  return {
    retries: options.retries ?? DEFAULT_RETRIES,
    baseDelayMs: options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS,
    rateLimitDelayMs: options.rateLimitDelayMs ?? DEFAULT_RATE_LIMIT_DELAY_MS,
  };
}

/**
 * Whether an error is worth retrying: rate limits, server errors and network
 * failures are transient; other 4xx responses (e.g. 404) are not.
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof FetchError) {
    return (
      error.status === 429 ||
      (error.status !== undefined && error.status >= 500)
    );
  }
  return true;
}

/** Run an operation, retrying transient failures with linear backoff. */
export async function withRetry<T>(
  operation: () => Promise<T>,
  settings: GitHubRetrySettings,
): Promise<T> {
  for (let attempt = 0; attempt < settings.retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === settings.retries - 1;
      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }
      const rateLimited = error instanceof FetchError && error.status === 429;
      const delay = rateLimited
        ? settings.rateLimitDelayMs * (attempt + 1)
        : settings.baseDelayMs * (attempt + 1);
      await sleep(delay);
    }
  }
  throw new Error('withRetry: no attempts configured');
}

/**
 * Perform a GitHub REST API request, retrying transient failures.
 * Non-OK responses throw a `FetchError` carrying the HTTP status.
 */
export async function githubRequest(
  path: string,
  options: GitHubRequestOptions = {},
): Promise<Response> {
  const baseUrl = options.baseUrl ?? GITHUB_API;
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  const token = options.token ?? process.env.GITHUB_TOKEN ?? '';
  warnIfMissingToken(token);
  const fetchImpl = options.fetchImpl ?? fetch;
  const settings = resolveRetrySettings(options);

  const headers: Record<string, string> = {
    Accept: options.accept ?? JSON_ACCEPT,
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': GITHUB_USER_AGENT,
  };
  if (token !== '') {
    headers.Authorization = `Bearer ${token}`;
  }

  const method = options.method ?? 'GET';
  const hasBody = options.body !== undefined;
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  return await withRetry(async () => {
    const response = await fetchImpl(url, {
      method,
      headers,
      ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
    });
    if (!response.ok) {
      throw new FetchError(
        `HTTP ${response.status} for ${url}`,
        url,
        response.status,
      );
    }
    return response;
  }, settings);
}

/** Perform a request, parse the JSON body and validate it with `schema`. */
export async function githubJson<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options: GitHubRequestOptions = {},
): Promise<T> {
  const response = await githubRequest(path, options);
  const json: unknown = await response.json();
  return schema.parse(json);
}

/** Perform a request and return the raw text body (used for READMEs). */
export async function githubText(
  path: string,
  options: GitHubRequestOptions = {},
): Promise<string> {
  const response = await githubRequest(path, {
    ...options,
    accept: options.accept ?? RAW_ACCEPT,
  });
  return await response.text();
}
