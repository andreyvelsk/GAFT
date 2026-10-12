import { config } from '../../../../config';
import {
  fetchPostById as defaultFetchPostById,
  fetchPosts as defaultFetchPosts,
} from '../../../../reddit/client';
import { postToReport } from '../../../../reddit/normalize';
import { prefilterReason } from '../../../../reddit/prefilter';
import type { RawPost, ReportEntry } from '../../../../shared/lib/types';
import type {
  DroppedPost,
  FetchStageError,
  FetchStageOptions,
  FetchStageResult,
} from './types';

/** Seconds in one hour. */
const SECONDS_PER_HOUR = 3600;

/** Human-readable message of an unknown error. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Fetch the posts of the configured window, normalize them and (unless the
 * prefilter is disabled) drop the obviously irrelevant ones with the
 * deterministic prefilter. The optional `maxPosts` limit is applied to the
 * kept posts.
 *
 * When `postIds` is set (approve mode) each id is fetched directly through
 * `fetchPostById`, normalized and kept as-is: the prefilter and the `maxPosts`
 * limit are not applied, and ids that cannot be fetched are recorded in
 * `errors`.
 */
export async function runFetchStage(
  options: FetchStageOptions = {},
): Promise<FetchStageResult> {
  const subreddit = options.subreddit ?? config.reddit.subreddit;
  const lookbackHours = options.lookbackHours ?? config.reddit.lookbackHours;
  const maxPosts = options.maxPosts ?? config.reddit.maxPosts;
  const prefilter = options.prefilter ?? config.reddit.prefilter;
  const now = options.now ?? new Date();
  const fetchPosts = options.fetchPosts ?? defaultFetchPosts;
  const fetchPostById = options.fetchPostById ?? defaultFetchPostById;

  const before = Math.floor(now.getTime() / 1000);
  const after = before - lookbackHours * SECONDS_PER_HOUR;
  const window = { subreddit, after, before };

  if (options.postIds !== undefined) {
    return await fetchByIds(options.postIds, window, fetchPostById);
  }

  const raw = await fetchPosts(window);

  const entries: ReportEntry[] = [];
  const dropped: DroppedPost[] = [];
  for (const post of raw) {
    const entry = postToReport(post);
    const reason = prefilter ? prefilterReason(entry) : null;
    if (reason === null) {
      entries.push(entry);
    } else {
      dropped.push({ entry, reason });
    }
  }

  const limited = maxPosts > 0 ? entries.slice(0, maxPosts) : entries;
  return { window, fetched: raw.length, entries: limited, dropped, errors: [] };
}

/**
 * Fetch the given post ids directly, normalizing each one and recording the
 * missing/failed ids as errors. The prefilter and the `maxPosts` limit are not
 * applied so that every explicitly approved post is kept.
 */
async function fetchByIds(
  postIds: readonly string[],
  window: FetchStageResult['window'],
  fetchPostById: (id: string) => Promise<RawPost | null>,
): Promise<FetchStageResult> {
  const entries: ReportEntry[] = [];
  const errors: FetchStageError[] = [];

  for (const id of postIds) {
    try {
      const post = await fetchPostById(id);
      if (post === null) {
        errors.push({ id, message: 'post not found' });
        continue;
      }
      entries.push(postToReport(post));
    } catch (error) {
      errors.push({ id, message: errorMessage(error) });
    }
  }

  return { window, fetched: entries.length, entries, dropped: [], errors };
}
