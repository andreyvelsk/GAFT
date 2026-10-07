import type { Logger } from '../../../shared/lib/types';

/** Lifecycle status of a reviewed post. */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * A post tracked in the review ledger.
 *
 * The ledger is append-only in spirit: an entry is created as `pending` and its
 * status only changes when a human approves or rejects it, so a later run never
 * loses a decision.
 */
export interface ReviewPost {
  /** Reddit post id (the approval key, e.g. `1abc2d3`). */
  id: string;

  /** Title of the source post. */
  title: string;

  /** Permalink of the source post. */
  permalink: string;

  /** Creation time of the source post (Unix seconds). */
  createdUtc: number;

  /** ISO timestamp of the first run that recorded the post. */
  firstSeenAt: string;

  /** Review status of the post. */
  status: ReviewStatus;

  /** Page slug, set after a successful approve. */
  slug?: string | undefined;

  /** ISO timestamp of the approve/reject decision. */
  decidedAt?: string | undefined;

  /**
   * Error message of the last failed approve attempt. Present while the post
   * stays `pending` so the failure is visible in the ledger.
   */
  error?: string | undefined;
}

/**
 * Machine-readable review ledger. Serialized to `REVIEW_FILE` as
 * `{ "posts": [ ... ] }`.
 */
export interface ReviewLedger {
  /** Tracked posts, in first-seen order. */
  posts: ReviewPost[];
}

/** Minimal post data required to append/refresh a post in the ledger. */
export interface ReviewCandidate {
  /** Reddit post id. */
  id: string;

  /** Title of the source post. */
  title: string;

  /** Permalink of the source post. */
  permalink: string;

  /** Creation time of the source post (Unix seconds). */
  createdUtc: number;
}

/** Options accepted by {@link loadReviewLedger}. */
export interface LoadReviewOptions {
  /** Source path (defaults to the shared `REVIEW_FILE`). */
  path?: string | undefined;
}

/** Options accepted by {@link saveReviewLedger}. */
export interface SaveReviewOptions {
  /** JSON destination (defaults to the shared `REVIEW_FILE`). */
  path?: string | undefined;

  /** Markdown destination (defaults to the shared `REVIEW_MARKDOWN_FILE`). */
  markdownPath?: string | undefined;

  /** Logger used to announce the written artifacts. */
  logger?: Logger;
}

/** Options accepted by the merge/mark helpers. */
export interface ReviewMutationOptions {
  /** Clock used for the `firstSeenAt`/`decidedAt` timestamps (defaults to now). */
  now?: (() => Date) | undefined;
}

/** Options accepted by {@link pruneReviewLedger}. */
export interface PruneReviewOptions extends ReviewMutationOptions {
  /**
   * Retention window in days for decided entries (defaults to
   * `DEFAULT_REVIEW_RETENTION_DAYS`). `0` or a negative value disables pruning.
   */
  retentionDays?: number | undefined;
}
