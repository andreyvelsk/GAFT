import { config } from '../../../../config';
import { fetchPosts as defaultFetchPosts } from '../../../../reddit/client';
import { postToReport } from '../../../../reddit/normalize';
import { prefilterReason } from '../../../../reddit/prefilter';
import type { ReportEntry } from '../../../../shared/lib/types';
import type {
  DroppedPost,
  FetchStageOptions,
  FetchStageResult,
} from './types';

/** Seconds in one hour. */
const SECONDS_PER_HOUR = 3600;

/**
 * Fetch the posts of the configured window, normalize them and (unless the
 * prefilter is disabled) drop the obviously irrelevant ones with the
 * deterministic prefilter. The optional `maxPosts` limit is applied to the
 * kept posts.
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

  const before = Math.floor(now.getTime() / 1000);
  const after = before - lookbackHours * SECONDS_PER_HOUR;
  const window = { subreddit, after, before };

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
  return { window, fetched: raw.length, entries: limited, dropped };
}
