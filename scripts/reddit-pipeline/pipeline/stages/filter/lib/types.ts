import type { FilterOptions, FilterVerdicts } from '../../../../agents/filter';
import type { ReportEntry } from '../../../../shared/lib/types';

/** Options accepted by the filter stage. */
export interface FilterStageOptions {
  /** Number of posts per LLM request (defaults to the config value). */
  batchSize?: number;

  /** Options forwarded to the filter agent (model, generator, …). */
  filterOptions?: FilterOptions;

  /** Injected classifier (used by tests). */
  classify?: (
    entries: readonly ReportEntry[],
    options: FilterOptions,
  ) => Promise<FilterVerdicts>;
}

/** A post skipped because the filter agent marked it irrelevant. */
export interface SkippedPost {
  /** Post that was skipped. */
  entry: ReportEntry;

  /** Reason for skipping. */
  reason: string;
}

/** Result of the filter stage. */
export interface FilterStageResult {
  /** Posts the agent marked as relevant. */
  relevant: ReportEntry[];

  /** Posts the agent marked as irrelevant. */
  skipped: SkippedPost[];
}
