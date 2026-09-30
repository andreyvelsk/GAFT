import {
  createMatchAgent,
  type MatchDecision,
  type MatchOptions,
} from '../../../../agents/match';
import type { ReportEntry } from '../../../../shared/lib/types';
import type {
  MatchStageOptions,
  MatchStageResult,
  MatchedPost,
} from './types';

/**
 * Decide CREATE/UPDATE for every post, preserving the input order. The stage is
 * intentionally per-post so a failure on one post can be isolated by the caller.
 *
 * The agent is built from the stage options so the configured decision backend
 * (`jev` or `llm`) is actually used; an injected `match` bypasses it.
 */
export async function runMatchStage(
  entries: readonly ReportEntry[],
  options: MatchStageOptions = {},
): Promise<MatchStageResult> {
  const agent = createMatchAgent({
    ...(options.backend !== undefined ? { backend: options.backend } : {}),
    ...(options.threshold !== undefined ? { threshold: options.threshold } : {}),
    ...(options.logger !== undefined ? { logger: options.logger } : {}),
  });
  const match =
    options.match ??
    ((
      entry: ReportEntry,
      callOptions: MatchOptions,
    ): Promise<MatchDecision> => agent.matchPost(entry, callOptions));
  const matchOptions = options.matchOptions ?? {};

  const decisions: MatchedPost[] = [];
  for (const entry of entries) {
    const decision = await match(entry, matchOptions);
    decisions.push({ entry, decision });
  }

  return { decisions };
}
