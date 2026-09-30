import type { AppConfig } from '../config/lib/types';
import type { DecisionBackend } from '../engines/decision';
import type {
  OrchestratorOptions,
  OrchestratorResult,
} from '../pipeline/orchestrator';
import type { Logger } from '../shared/lib/types';

/**
 * Command-line overrides parsed from `process.argv`. Every field is optional:
 * an absent field leaves the corresponding environment-derived configuration
 * untouched. The values are applied on top of the resolved {@link AppConfig}
 * (see `applyArgs`) and the orchestrator options (see
 * `orchestratorOptionsFromArgs`).
 */
export interface CliArgs {
  /** Print the usage help and exit without running the pipeline. */
  help: boolean;

  // --- Reddit fetch window ---
  /** Subreddit to scan (overrides `REDDIT_SUBREDDIT`). */
  subreddit?: string;

  /** Lookback window in hours (overrides `REDDIT_LOOKBACK_HOURS`). */
  lookbackHours?: number;

  /** Maximum number of posts to process, `0` = unlimited (overrides `REDDIT_MAX_POSTS`). */
  maxPosts?: number;

  /** Number of posts per LLM batch (overrides `REDDIT_BATCH_SIZE`). */
  batchSize?: number;

  /** Whether to run without writing any files (overrides `REDDIT_DRY_RUN`). */
  dryRun?: boolean;

  /** Whether to run the deterministic prefilter (overrides `REDDIT_PREFILTER`). */
  prefilter?: boolean;

  // --- Decision backends (filter / match / category) ---
  /** Backend for the filter agent (overrides `REDDIT_FILTER_BACKEND`). */
  filterBackend?: DecisionBackend;

  /** Backend for the match agent (overrides `REDDIT_MATCH_BACKEND`). */
  matchBackend?: DecisionBackend;

  /** Backend for the category agent (overrides `REDDIT_CATEGORY_BACKEND`). */
  categoryBackend?: DecisionBackend;

  // --- Decision (Jev / System One) connection ---
  /** Jev base URL (overrides `OPENROUTER_DECISIONS_BASE_URL`). */
  decisionsBaseUrl?: string;

  /** Jev model (overrides `REDDIT_DECISIONS_MODEL`). */
  decisionsModel?: string;

  // --- Models ---
  /** Model for the filter agent (overrides `REDDIT_FILTER_MODEL`). */
  filterModel?: string;

  /** Model for the match agent (overrides `REDDIT_MATCH_MODEL`). */
  matchModel?: string;

  /** Model for the create agent (overrides `REDDIT_CREATE_MODEL`). */
  createModel?: string;

  /** Model for the update agent (overrides `REDDIT_UPDATE_MODEL`). */
  updateModel?: string;

  /** Model for the category agent (overrides `REDDIT_CATEGORY_MODEL`). */
  categoryModel?: string;

  // --- Thresholds (0..1) ---
  /** Confidence threshold for the filter agent (overrides `REDDIT_FILTER_THRESHOLD`). */
  filterThreshold?: number;

  /** Confidence threshold for the match agent (overrides `REDDIT_MATCH_THRESHOLD`). */
  matchThreshold?: number;

  /** Confidence threshold for the category agent (overrides `REDDIT_CATEGORY_THRESHOLD`). */
  categoryThreshold?: number;

  // --- Reports ---
  /** JSON report path; the Markdown report is derived from it. */
  reportPath?: string;

  /** When `false`, the report is not written to disk. */
  writeReport?: boolean;

  // --- Misc ---
  /** Reference time for the fetch window (overrides "now"). */
  now?: Date;
}

/** Injectable dependencies of the CLI (used by tests). */
export interface CliDependencies {
  /** Loads the resolved configuration (defaults to `loadConfig`). */
  loadConfig?: () => AppConfig;

  /** Runs the pipeline (defaults to `runPipeline`). */
  runPipeline?: (options: OrchestratorOptions) => Promise<OrchestratorResult>;

  /** Creates the structured logger (defaults to `createLogger`). */
  createLogger?: () => Logger;

  /** Sink receiving each printed line (defaults to stdout). */
  write?: (line: string) => void;

  /** Raw command-line arguments (defaults to an empty list). */
  argv?: readonly string[];
}

/** Outcome of a CLI invocation. */
export interface CliResult {
  /** Process exit code: `0` on success, non-zero on a fatal error. */
  exitCode: number;

  /** The pipeline result, or `null` when the run failed fatally. */
  result: OrchestratorResult | null;
}
