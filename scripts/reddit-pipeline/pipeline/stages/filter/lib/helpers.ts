import {
  createFilterAgent,
  type FilterOptions,
  type FilterVerdicts,
} from '../../../../agents/filter';
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
 *
 * The agent is built from the stage options so the configured decision backend
 * (`jev` or `llm`) is actually used; an injected `classify` bypasses it.
 */
export async function runFilterStage(
  entries: readonly ReportEntry[],
  options: FilterStageOptions = {},
): Promise<FilterStageResult> {
  if (entries.length === 0) {
    return { relevant: [], skipped: [] };
  }

  const agent = createFilterAgent({
    ...(options.backend !== undefined ? { backend: options.backend } : {}),
    ...(options.threshold !== undefined ? { threshold: options.threshold } : {}),
    ...(options.logger !== undefined ? { logger: options.logger } : {}),
  });
  const classify =
    options.classify ??
    ((
      input: readonly ReportEntry[],
      callOptions: FilterOptions,
    ): Promise<FilterVerdicts> => agent.classifyPosts(input, callOptions));
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
