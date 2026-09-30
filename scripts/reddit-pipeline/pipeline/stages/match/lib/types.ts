import type { MatchDecision, MatchOptions } from '../../../../agents/match';
import type { DecisionBackend } from '../../../../engines/decision';
import type { Logger, ReportEntry } from '../../../../shared/lib/types';

/** Options accepted by the match stage. */
export interface MatchStageOptions {
  /** Decision backend of the match agent (`llm` by default). */
  backend?: DecisionBackend;

  /** Jev: confidence threshold below which a warning is logged. */
  threshold?: number;

  /** Structured logger shared with the match agent. */
  logger?: Logger;

  /** Options forwarded to the match agent (model, generator, index, …). */
  matchOptions?: MatchOptions;

  /** Injected matcher (used by tests). */
  match?: (
    entry: ReportEntry,
    options: MatchOptions,
  ) => Promise<MatchDecision>;
}

/** A post paired with the CREATE/UPDATE decision of the match agent. */
export interface MatchedPost {
  /** Post that was matched. */
  entry: ReportEntry;

  /** Decision returned by the agent. */
  decision: MatchDecision;
}

/** Result of the match stage. */
export interface MatchStageResult {
  /** Decisions, in the same order as the input posts. */
  decisions: MatchedPost[];
}
