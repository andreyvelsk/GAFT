import { classifyPosts as defaultClassify } from '../../../../agents/filter';
import { config } from '../../../../config';
import type { ReportEntry } from '../../../../shared/lib/types';
import type {
  FilterStageOptions,
  FilterStageResult,
  SkippedPost,
} from './types';

/**
 * Classify the posts in batches and split them into relevant and skipped.
 * The verdicts are reconciled by the agent, so every input post gets a verdict.
 */
export async function runFilterStage(
  entries: readonly ReportEntry[],
  options: FilterStageOptions = {},
): Promise<FilterStageResult> {
  if (entries.length === 0) {
    return { relevant: [], skipped: [] };
  }

  const classify = options.classify ?? defaultClassify;
  const batchSize = options.batchSize ?? config.reddit.batchSize;
  const verdicts = await classify(entries, {
    ...options.filterOptions,
    batchSize,
  });

  const relevantById = new Map(
    verdicts.map((verdict) => [verdict.id, verdict.relevant]),
  );

  const relevant: ReportEntry[] = [];
  const skipped: SkippedPost[] = [];
  for (const entry of entries) {
    if (relevantById.get(entry.id) === true) {
      relevant.push(entry);
    } else {
      skipped.push({ entry, reason: 'not relevant' });
    }
  }

  return { relevant, skipped };
}
