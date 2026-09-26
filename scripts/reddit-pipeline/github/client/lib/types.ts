import { z } from 'zod';

/** Options accepted by the low-level GitHub request helper. */
export interface GitHubRequestOptions {
  /** HTTP method (defaults to `GET`). */
  method?: string;

  /** JSON body serialized and sent with the request. */
  body?: unknown;

  /** `Accept` header value (defaults to the GitHub JSON media type). */
  accept?: string;

  /** Explicit token; falls back to the `GITHUB_TOKEN` env var. */
  token?: string;

  /** API base URL (defaults to the public GitHub API). */
  baseUrl?: string;

  /** Fetch implementation (used by tests). */
  fetchImpl?: typeof fetch;

  /** Total attempts, including the first one. */
  retries?: number;

  /** Base backoff delay (ms) for transient failures. */
  baseDelayMs?: number;

  /** Backoff delay (ms) for HTTP 429 responses. */
  rateLimitDelayMs?: number;
}

/** Retry/backoff settings resolved from the request options. */
export interface GitHubRetrySettings {
  /** Total attempts, including the first one. */
  retries: number;

  /** Base backoff delay (ms) for transient failures. */
  baseDelayMs: number;

  /** Backoff delay (ms) for HTTP 429 responses. */
  rateLimitDelayMs: number;
}

/** A single repository as returned by the GitHub search API. */
export const githubSearchItemSchema = z.object({
  /** `owner/repo` identifier. */
  full_name: z.string(),

  /** Repository name (without the owner). */
  name: z.string(),

  /** Repository owner. */
  owner: z.object({ login: z.string() }),

  /** Web URL of the repository. */
  html_url: z.string(),

  /** Repository description, when present. */
  description: z.string().nullable().default(null),

  /** Number of stargazers. */
  stargazers_count: z.number().default(0),

  /** Default branch name. */
  default_branch: z.string().default('main'),
});

export type GitHubSearchItem = z.infer<typeof githubSearchItemSchema>;

/** Response of `GET /search/repositories`. */
export const githubSearchResponseSchema = z.object({
  /** Total number of matches reported by GitHub. */
  total_count: z.number().default(0),

  /** Page of matched repositories. */
  items: z.array(githubSearchItemSchema).default([]),
});

export type GitHubSearchResponse = z.infer<typeof githubSearchResponseSchema>;

/** Response of `GET /repos/{owner}/{repo}/releases/latest`. */
export const githubReleaseResponseSchema = z.object({
  /** Git tag of the release. */
  tag_name: z.string(),

  /** Human-readable release name, when present. */
  name: z.string().nullable().default(null),

  /** Web URL of the specific release tag. */
  html_url: z.string(),

  /** ISO timestamp of the publication, when present. */
  published_at: z.string().nullable().default(null),
});

export type GitHubReleaseResponse = z.infer<typeof githubReleaseResponseSchema>;
