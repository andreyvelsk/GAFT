import type { GitHubRequestOptions } from '../../client/lib/types';

/** Options accepted by the repository helpers. */
export type RepoOptions = GitHubRequestOptions;

/** A repository reference as `owner/repo`. */
export interface GitHubRepoRef {
  /** Repository owner (user or organisation). */
  owner: string;

  /** Repository name. */
  repo: string;
}

/** Repository details resolved by `findRepo`. */
export interface GitHubRepo extends GitHubRepoRef {
  /** `owner/repo` identifier. */
  fullName: string;

  /** Web URL of the repository. */
  htmlUrl: string;

  /** Repository description (empty string when absent). */
  description: string;

  /** Number of stargazers. */
  stars: number;

  /** Default branch name. */
  defaultBranch: string;
}

/** Details of the latest release of a repository. */
export interface ReleaseInfo {
  /** Git tag of the release. */
  tagName: string;

  /** Human-readable release name (falls back to the tag). */
  name: string;

  /** ISO timestamp of the publication (empty string when absent). */
  publishedAt: string;

  /** Canonical "latest release" URL (`.../releases/latest`). */
  url: string;

  /** Web URL of the specific release tag. */
  htmlUrl: string;
}
