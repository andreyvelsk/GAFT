import type { DecisionBackend } from '../../../engines/decision';
import type { AgentName } from '../../../engines/model';
import type { Logger } from '../../../shared/lib/types';
import type { UsageTotals } from '../../../shared/lib/usage';

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

/** Token and cost usage of one agent in a run. */
export interface AgentUsage extends UsageTotals {
  /** Agent the usage belongs to. */
  agent: AgentName;

  /** Model the agent ran on. */
  model: string;

  /** Decision backend of the agent (`filter`/`match`/`category` only). */
  backend?: DecisionBackend;
}

/** Aggregated model usage of a run. */
export interface RunUsage {
  /** Usage per agent, in a stable order. */
  byAgent: AgentUsage[];

  /** Sum of every agent. */
  total: UsageTotals;
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

  /** Model usage and cost per agent. */
  usage: RunUsage;
}

/** Options accepted by the report builder. */
export interface ReportBuilderOptions {
  /** Whether the run is a dry run (defaults to `false`). */
  dryRun?: boolean;

  /** Clock used for the start/finish timestamps (defaults to `Date`). */
  now?: () => Date;

  /**
   * Resolve the model usage at build time. A getter (rather than a value) so
   * the builder can read a tracker that is still being filled during the run.
   */
  usage?: () => RunUsage;
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

/** Options accepted by `writeReportMarkdown`. */
export interface WriteReportMarkdownOptions {
  /** Destination path (defaults to the shared `REPORT_MARKDOWN_FILE`). */
  markdownPath?: string;

  /** Logger used to announce the written artifact. */
  logger?: Logger;
}

/** Human-readable breakdown of a run report. */
export interface ReportSummary {
  /** Posts dropped by the deterministic prefilter. */
  prefilter: number;

  /** Posts classified as not relevant by the filter agent. */
  filter: number;

  /** Posts skipped for any other reason. */
  otherSkipped: number;

  /** Entries of the pages created during the run. */
  created: PostReportEntry[];

  /** Entries of the pages updated during the run. */
  updated: PostReportEntry[];

  /** Entries of the posts that failed during the run. */
  errors: PostReportEntry[];
}
