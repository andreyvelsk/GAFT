import {
  findRepo,
  parseRepoRef,
  type GitHubRepo,
  type GitHubRepoRef,
} from '../../../../github/repo';
import type { GitHubSearchOptions } from './types';

/**
 * Resolve a repository from a project name or an exact GitHub URL.
 * Returns `null` for a blank query or when nothing matches.
 */
export async function searchRepository(
  query: string,
  options: GitHubSearchOptions = {},
): Promise<GitHubRepo | null> {
  const trimmed = query.trim();
  if (trimmed === '') {
    return null;
  }
  return await findRepo(trimmed, options);
}

/**
 * Resolve an exact `owner/repo` reference from a GitHub URL or shorthand
 * without any network access. Returns `null` when the input is neither.
 */
export function resolveRepositoryRef(query: string): GitHubRepoRef | null {
  return parseRepoRef(query.trim());
}
