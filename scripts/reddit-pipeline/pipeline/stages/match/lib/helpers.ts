import { matchPost as defaultMatch } from '../../../../agents/match';
import type { ReportEntry } from '../../../../shared/lib/types';
import type {
  MatchStageOptions,
  MatchStageResult,
  MatchedPost,
} from './types';

/**
 * Decide CREATE/UPDATE for every post, preserving the input order. The stage is
 * intentionally per-post so a failure on one post can be isolated by the caller.
 */
export async function runMatchStage(
  entries: readonly ReportEntry[],
  options: MatchStageOptions = {},
): Promise<MatchStageResult> {
  const match = options.match ?? defaultMatch;
  const matchOptions = options.matchOptions ?? {};

  const decisions: MatchedPost[] = [];
  for (const entry of entries) {
    const decision = await match(entry, matchOptions);
    decisions.push({ entry, decision });
  }

  return { decisions };
}
