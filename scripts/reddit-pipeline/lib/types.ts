import type { AppConfig } from '../config/lib/types';
import type {
  OrchestratorOptions,
  OrchestratorResult,
} from '../pipeline/orchestrator';
import type { Logger } from '../shared/lib/types';

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
}

/** Outcome of a CLI invocation. */
export interface CliResult {
  /** Process exit code: `0` on success, non-zero on a fatal error. */
  exitCode: number;

  /** The pipeline result, or `null` when the run failed fatally. */
  result: OrchestratorResult | null;
}
