import {
  latestRelease,
  latestReleaseUrl,
  type ReleaseInfo,
} from '../../../github/repo';
import type { GitHubReleaseOptions } from './types';

/** Fetch the latest release of a repository; `null` when it has none. */
export async function getLatestRelease(
  owner: string,
  repo: string,
  options: GitHubReleaseOptions = {},
): Promise<ReleaseInfo | null> {
  return await latestRelease(owner, repo, options);
}

/** Canonical URL of the "latest release" page of a repository. */
export function getLatestReleaseUrl(owner: string, repo: string): string {
  return latestReleaseUrl(owner, repo);
}
