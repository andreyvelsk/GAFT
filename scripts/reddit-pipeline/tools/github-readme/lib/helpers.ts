import { readReadme } from '../../../github/repo';
import type { GitHubReadmeOptions } from './types';

/** Read the README of a repository as raw text; `null` when absent. */
export async function readRepositoryReadme(
  owner: string,
  repo: string,
  options: GitHubReadmeOptions = {},
): Promise<string | null> {
  return await readReadme(owner, repo, options);
}
