import type { FetchWindow } from '../../../../reddit/client/lib/types';
import type { PrefilterReason } from '../../../../reddit/prefilter';
import type { RawPost, ReportEntry } from '../../../../shared/lib/types';

/** Options accepted by the fetch stage. */
export interface FetchStageOptions {
  /** Subreddit to scan (defaults to the config value). */
  subreddit?: string;

  /** Lookback window in hours (defaults to the config value). */
  lookbackHours?: number;

  /** Maximum number of posts to keep, `0` = unlimited (defaults to config). */
  maxPosts?: number;

  /** Whether to apply the deterministic prefilter (defaults to config). */
  prefilter?: boolean;

  /** Reference time used to compute the window (defaults to now). */
  now?: Date;

  /**
   * Reddit post ids to fetch directly (approve mode). When set, each id is
   * fetched through {@link FetchStageOptions.fetchPostById}, the prefilter is
   * not applied and the `maxPosts` limit is ignored.
   */
  postIds?: readonly string[];

  /** Injected post fetcher (used by tests). */
  fetchPosts?: (window: FetchWindow) => Promise<RawPost[]>;

  /** Injected single-post fetcher (used by tests). */
  fetchPostById?: (id: string) => Promise<RawPost | null>;
}

/** A post id that could not be fetched in `approve` mode. */
export interface FetchStageError {
  /** Reddit post id that was requested. */
  id: string;

  /** Human-readable error message. */
  message: string;
}

/** A post dropped by the deterministic prefilter. */
export interface DroppedPost {
  /** Normalized post that was dropped. */
  entry: ReportEntry;

  /** Reason returned by the prefilter. */
  reason: PrefilterReason;
}

/** Result of the fetch stage. */
export interface FetchStageResult {
  /** Window that was queried. */
  window: FetchWindow;

  /** Number of raw posts returned by the source. */
  fetched: number;

  /** Posts kept after normalization and prefiltering. */
  entries: ReportEntry[];

  /** Posts dropped by the prefilter. */
  dropped: DroppedPost[];

  /**
   * Errors for post ids that could not be fetched (approve mode). Absent when
   * the stage ran in the regular window mode.
   */
  errors?: FetchStageError[];
}
