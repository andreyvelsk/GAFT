import { FetchError } from '../../../shared/lib/errors';
import { githubJson, githubText } from '../../client/lib/helpers';
import {
  githubReleaseResponseSchema,
  githubSearchItemSchema,
  githubSearchResponseSchema,
  type GitHubSearchItem,
} from '../../client/lib/types';
import type {
  GitHubRepo,
  GitHubRepoRef,
  ReleaseInfo,
  RepoOptions,
} from './types';

/** Number of repositories requested from the search API. */
const SEARCH_PAGE_SIZE = 10;

/** Public GitHub web host used to build canonical URLs. */
const GITHUB_WEB = 'https://github.com';

/** Normalize a project/repository name for fuzzy comparison. */
export function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * Pick the search item whose name best matches the query.
 * An exact (normalized) name match wins; otherwise the first result is used.
 */
export function pickBestMatch(
  query: string,
  items: readonly GitHubSearchItem[],
): GitHubSearchItem | null {
  const target = normalizeName(query);
  const exact = items.find((item) => normalizeName(item.name) === target);
  if (exact !== undefined) {
    return exact;
  }
  return items[0] ?? null;
}

/** Map a repository payload onto the public repository shape. */
function toRepo(item: GitHubSearchItem): GitHubRepo {
  return {
    owner: item.owner.login,
    repo: item.name,
    fullName: item.full_name,
    htmlUrl: item.html_url,
    description: item.description ?? '',
    stars: item.stargazers_count,
    defaultBranch: item.default_branch,
  };
}

/** Extract `owner/repo` from a GitHub URL; `null` when the URL is not one. */
export function parseRepoUrl(url: string): GitHubRepoRef | null {
  const match = /github\.com\/([^/]+)\/([^/?#]+)/i.exec(url);
  if (match === null) {
    return null;
  }
  const owner = match[1];
  const rawRepo = match[2];
  if (owner === undefined || rawRepo === undefined) {
    return null;
  }
  const repo = rawRepo.replace(/\.git$/, '');
  if (repo === '') {
    return null;
  }
  return { owner, repo };
}

/**
 * Resolve an exact repository reference from a GitHub URL or an `owner/repo`
 * shorthand. Returns `null` when the input is neither.
 */
export function parseRepoRef(input: string): GitHubRepoRef | null {
  const fromUrl = parseRepoUrl(input);
  if (fromUrl !== null) {
    return fromUrl;
  }
  const match = /^([\w.-]+)\/([\w.-]+)$/.exec(input.trim());
  if (match === null) {
    return null;
  }
  const owner = match[1];
  const repo = match[2];
  if (owner === undefined || repo === undefined) {
    return null;
  }
  return { owner, repo };
}

/** Fetch a repository by its exact `owner/repo` coordinates. */
export async function getRepo(
  owner: string,
  repo: string,
  options: RepoOptions = {},
): Promise<GitHubRepo> {
  const item = await githubJson(
    `/repos/${owner}/${repo}`,
    githubSearchItemSchema,
    options,
  );
  return toRepo(item);
}

/**
 * Resolve a repository.
 *
 * The primary path is an exact reference — a GitHub URL or `owner/repo`
 * shorthand (e.g. the link taken from the Reddit post). Only when the input is
 * a bare project name does it fall back to a best-effort name search, which is
 * inherently ambiguous and should be avoided when an exact link is available.
 */
export async function findRepo(
  query: string,
  options: RepoOptions = {},
): Promise<GitHubRepo | null> {
  const ref = parseRepoRef(query);
  if (ref !== null) {
    return await getRepo(ref.owner, ref.repo, options);
  }

  const params = new URLSearchParams({
    q: `${query} in:name`,
    per_page: String(SEARCH_PAGE_SIZE),
  });
  const data = await githubJson(
    `/search/repositories?${params.toString()}`,
    githubSearchResponseSchema,
    options,
  );
  const best = pickBestMatch(query, data.items);
  return best === null ? null : toRepo(best);
}

/** Read the README of a repository as raw text; `null` when absent. */
export async function readReadme(
  owner: string,
  repo: string,
  options: RepoOptions = {},
): Promise<string | null> {
  try {
    return await githubText(`/repos/${owner}/${repo}/readme`, options);
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Canonical URL of the "latest release" page of a repository. */
export function latestReleaseUrl(owner: string, repo: string): string {
  return `${GITHUB_WEB}/${owner}/${repo}/releases/latest`;
}

/**
 * Fetch the latest release of a repository.
 * Returns `null` when the repository has no releases (HTTP 404).
 */
export async function latestRelease(
  owner: string,
  repo: string,
  options: RepoOptions = {},
): Promise<ReleaseInfo | null> {
  try {
    const data = await githubJson(
      `/repos/${owner}/${repo}/releases/latest`,
      githubReleaseResponseSchema,
      options,
    );
    return {
      tagName: data.tag_name,
      name: data.name ?? data.tag_name,
      publishedAt: data.published_at ?? '',
      url: latestReleaseUrl(owner, repo),
      htmlUrl: data.html_url,
    };
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
