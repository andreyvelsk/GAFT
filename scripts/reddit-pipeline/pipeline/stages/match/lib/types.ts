import type { MatchDecision, MatchOptions } from '../../../../agents/match';
import type { ReportEntry } from '../../../../shared/lib/types';

/** Options accepted by the match stage. */
export interface MatchStageOptions {
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
