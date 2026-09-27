import type { Logger } from '../../../shared/lib/types';

/** Outcome of a single post in a pipeline run. */
export type PostAction = 'created' | 'updated' | 'skipped' | 'error';

/** Per-post detail of a pipeline run. */
export interface PostReportEntry {
  /** Reddit post id. */
  id: string;

  /** Permalink of the source post. */
  permalink: string;

  /** Title of the source post. */
  title: string;

  /** What the pipeline did with the post. */
  action: PostAction;

  /** Human-readable reason for the action. */
  reason: string;

  /** Target page slug (present for created/updated posts). */
  slug?: string;

  /** Error message (present for failed posts). */
  error?: string;
}

/** Aggregate counters of a pipeline run. */
export interface ReportCounts {
  /** Total number of posts considered. */
  total: number;

  /** Number of pages created. */
  created: number;

  /** Number of pages updated. */
  updated: number;

  /** Number of posts skipped (prefilter or filter). */
  skipped: number;

  /** Number of posts that failed during processing. */
  errors: number;
}

/** Full report of a pipeline run. */
export interface RunReport {
  /** ISO timestamp of the run start. */
  startedAt: string;

  /** ISO timestamp of the run end. */
  finishedAt: string;

  /** Whether the run was a dry run (no content files written). */
  dryRun: boolean;

  /** Aggregate counters. */
  counts: ReportCounts;

  /** Per-post details, in processing order. */
  posts: PostReportEntry[];
}

/** Options accepted by the report builder. */
export interface ReportBuilderOptions {
  /** Whether the run is a dry run (defaults to `false`). */
  dryRun?: boolean;

  /** Clock used for the start/finish timestamps (defaults to `Date`). */
  now?: () => Date;
}

/** Accumulates per-post entries and produces a run report. */
export interface ReportBuilder {
  /** Record the outcome of a single post. */
  add(entry: PostReportEntry): void;

  /** Snapshot of the recorded entries. */
  entries(): PostReportEntry[];

  /** Counters of the recorded entries. */
  counts(): ReportCounts;

  /** Build the immutable run report. */
  build(): RunReport;
}

/** Options accepted by `writeReport`. */
export interface WriteReportOptions {
  /** Destination path (defaults to the shared `REPORT_FILE`). */
  reportPath?: string;

  /** Logger used to announce the written artifact. */
  logger?: Logger;
}
