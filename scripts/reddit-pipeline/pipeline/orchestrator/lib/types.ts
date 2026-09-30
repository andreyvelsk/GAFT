import type { AppConfig } from '../../../config/lib/types';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import type { PricingTable } from '../../../shared/lib/pricing';
import type { RunReport } from '../../report';
import type {
  CreateStageOptions,
  CreateStageResult,
} from '../../stages/create';
import type {
  FetchStageOptions,
  FetchStageResult,
} from '../../stages/fetch';
import type {
  FilterStageOptions,
  FilterStageResult,
} from '../../stages/filter';
import type {
  MatchStageOptions,
  MatchStageResult,
} from '../../stages/match';
import type {
  UpdateStageOptions,
  UpdateStageResult,
} from '../../stages/update';

/** Per-stage option overrides passed to the orchestrator. */
export interface OrchestratorStageOptions {
  fetch?: FetchStageOptions;
  filter?: FilterStageOptions;
  match?: MatchStageOptions;
  create?: CreateStageOptions;
  update?: UpdateStageOptions;
}

/** Injectable stage implementations (used by tests). */
export interface OrchestratorDependencies {
  fetchStage?: (options: FetchStageOptions) => Promise<FetchStageResult>;

  filterStage?: (
    entries: readonly ReportEntry[],
    options: FilterStageOptions,
  ) => Promise<FilterStageResult>;

  matchStage?: (
    entries: readonly ReportEntry[],
    options: MatchStageOptions,
  ) => Promise<MatchStageResult>;

  createStage?: (
    entry: ReportEntry,
    options: CreateStageOptions,
  ) => Promise<CreateStageResult>;

  updateStage?: (
    entry: ReportEntry,
    slug: string,
    options: UpdateStageOptions,
  ) => Promise<UpdateStageResult>;
}

/** Options accepted by `runPipeline`. */
export interface OrchestratorOptions {
  /** Resolved configuration (defaults to the process environment). */
  config?: AppConfig;

  /** Reference time used for the fetch window and the report (defaults to now). */
  now?: Date;

  /** Structured logger (defaults to a plain stdout logger). */
  logger?: Logger;

  /** Destination of the run report (defaults to the shared `REPORT_FILE`). */
  reportPath?: string;

  /**
   * Model price table used to estimate LLM costs. When omitted it is loaded
   * from OpenRouter at the start of the run (degrading to an empty table on
   * failure).
   */
  pricing?: PricingTable;

  /** When `false`, the report is not written to disk (defaults to `true`). */
  writeReport?: boolean;

  /** Per-stage option overrides. */
  stages?: OrchestratorStageOptions;

  /** Injected stage implementations. */
  deps?: OrchestratorDependencies;
}

/** Result of a pipeline run. */
export interface OrchestratorResult {
  /** The run report. */
  report: RunReport;

  /** Path of the written report, or `null` when it was not written. */
  reportPath: string | null;
}
