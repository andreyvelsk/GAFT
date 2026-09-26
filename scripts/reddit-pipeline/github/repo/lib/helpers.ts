import { FetchError } from '../../../shared/lib/errors';
import { githubJson, githubText } from '../../client/lib/helpers';
import {
  githubReleaseResponseSchema,
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

/** Map a search item onto the public repository shape. */
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

/** Find a GitHub repository by (fuzzy) name; `null` when nothing matches. */
export async function findRepo(
  query: string,
  options: RepoOptions = {},
): Promise<GitHubRepo | null> {
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
