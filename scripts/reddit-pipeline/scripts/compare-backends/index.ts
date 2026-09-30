import { createCategoryAgent } from '../../agents/category';
import { createFilterAgent } from '../../agents/filter';
import { createMatchAgent, type MatchDecision } from '../../agents/match';
import { fetchPostById, parsePostId } from '../../reddit/client';
import { postToReport } from '../../reddit/normalize';
import { sleep } from '../../shared/lib/helpers';
import { createLogger } from '../../shared/lib/logger';
import { REAL_POST_CASES } from '../../agents/filter/tests/fixtures/real-posts';

import {
  agreement,
  bestByAccuracy,
  bestByF1,
  evaluate,
  thresholdGrid,
  thresholdScores,
} from './lib/helpers';

export * from './lib/helpers';
export type * from './lib/types';

import type {
  CategoryComparison,
  CategoryRow,
  CompareRunOptions,
  ConfusionMatrix,
  FilterComparison,
  FilterRow,
  LoadedCase,
  MatchComparison,
  MatchRow,
  ProbabilityPoint,
} from './lib/types';

/** Default pause between external calls, in milliseconds. */
const DEFAULT_DELAY_MS = 200;

/** Resolve the run logger and delay from the shared options. */
function runContext(options: CompareRunOptions): {
  logger: ReturnType<typeof createLogger>;
  delay: number;
} {
  return {
    logger: options.logger ?? createLogger(),
    delay: options.delayMs ?? DEFAULT_DELAY_MS,
  };
}

/**
 * Load the real-post fixtures into report entries. A failing fetch (unknown id,
 * missing post, network error) is logged as a warning and skipped.
 */
export async function loadCases(
  options: CompareRunOptions = {},
): Promise<LoadedCase[]> {
  const { logger, delay } = runContext(options);
  const cases =
    options.limit === undefined
      ? REAL_POST_CASES
      : REAL_POST_CASES.slice(0, options.limit);
  const loaded: LoadedCase[] = [];

  for (const item of cases) {
    try {
      const id = parsePostId(item.url);
      if (id === null) {
        throw new Error(`cannot extract post id from ${item.url}`);
      }
      const post = await fetchPostById(id);
      if (post === null) {
        throw new Error(`post ${id} not found`);
      }
      loaded.push({
        entry: postToReport(post),
        expected: item.expected,
        ...(item.note !== undefined ? { note: item.note } : {}),
      });
      logger.info('loaded post', { id, expected: item.expected });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('skipping post: load failed', {
        url: item.url,
        error: message,
      });
    }
    await sleep(delay);
  }

  return loaded;
}

/**
 * Compare the `filter` agent across the `jev` and `llm` backends: per-post
 * verdicts, accuracy and confusion matrices, agreement, and — when no fixed
 * threshold is given — a sweep over the saved Jev probabilities.
 */
export async function compareFilter(
  cases: readonly LoadedCase[],
  options: CompareRunOptions = {},
): Promise<FilterComparison> {
  const { logger, delay } = runContext(options);
  const jev = createFilterAgent({
    backend: 'jev',
    ...(options.threshold !== undefined ? { threshold: options.threshold } : {}),
    logger,
  });
  const llm = createFilterAgent({ backend: 'llm', logger });
  const rows: FilterRow[] = [];

  for (const item of cases) {
    try {
      const [jevVerdict] = await jev.classifyPosts([item.entry]);
      await sleep(delay);
      const [llmVerdict] = await llm.classifyPosts([item.entry]);
      await sleep(delay);
      if (jevVerdict === undefined || llmVerdict === undefined) {
        logger.warn('skipping post: missing verdict', { id: item.entry.id });
        continue;
      }
      rows.push({
        id: item.entry.id,
        expected: item.expected,
        jevRelevant: jevVerdict.relevant,
        llmVerdict: llmVerdict.relevant,
        jevMatches: jevVerdict.relevant === item.expected,
        llmMatches: llmVerdict.relevant === item.expected,
        ...(jevVerdict.probability !== undefined
          ? { jevProbability: jevVerdict.probability }
          : {}),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('skipping post: classification failed', {
        id: item.entry.id,
        error: message,
      });
    }
  }

  const comparison: FilterComparison = {
    rows,
    jev: evaluate(
      rows.map((row) => ({
        id: row.id,
        expected: row.expected,
        predicted: row.jevRelevant,
      })),
    ),
    llm: evaluate(
      rows.map((row) => ({
        id: row.id,
        expected: row.expected,
        predicted: row.llmVerdict,
      })),
    ),
    agreement: agreement(
      rows.map((row) => row.jevRelevant),
      rows.map((row) => row.llmVerdict),
    ),
  };

  if (options.threshold === undefined) {
    const points: ProbabilityPoint[] = rows
      .filter(
        (row): row is FilterRow & { jevProbability: number } =>
          row.jevProbability !== undefined,
      )
      .map((row) => ({
        id: row.id,
        expected: row.expected,
        probability: row.jevProbability,
      }));

    if (points.length > 0) {
      const sweep = thresholdScores(points, thresholdGrid());
      comparison.sweep = sweep;
      const byAccuracy = bestByAccuracy(sweep);
      const byF1 = bestByF1(sweep);
      if (byAccuracy !== undefined) {
        comparison.bestByAccuracy = byAccuracy;
      }
      if (byF1 !== undefined) {
        comparison.bestByF1 = byF1;
      }
    }
  }

  return comparison;
}

/** Serialize a match decision into a comparable label. */
function matchLabel(decision: MatchDecision): string {
  return `${decision.action}:${decision.slug}`;
}

/** Compare the `match` agent across the two backends (action + slug agreement). */
export async function compareMatch(
  cases: readonly LoadedCase[],
  options: CompareRunOptions = {},
): Promise<MatchComparison> {
  const { logger, delay } = runContext(options);
  const jev = createMatchAgent({
    backend: 'jev',
    ...(options.threshold !== undefined ? { threshold: options.threshold } : {}),
    logger,
  });
  const llm = createMatchAgent({ backend: 'llm', logger });
  const rows: MatchRow[] = [];

  for (const item of cases) {
    try {
      const jevDecision = await jev.matchPost(item.entry);
      await sleep(delay);
      const llmDecision = await llm.matchPost(item.entry);
      await sleep(delay);
      rows.push({
        id: item.entry.id,
        jev: jevDecision,
        llm: llmDecision,
        agree: matchLabel(jevDecision) === matchLabel(llmDecision),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('skipping post: match failed', {
        id: item.entry.id,
        error: message,
      });
    }
  }

  return {
    rows,
    agreement: agreement(
      rows.map((row) => matchLabel(row.jev)),
      rows.map((row) => matchLabel(row.llm)),
    ),
  };
}

/** Compare the `category` agent across the two backends (category agreement). */
export async function compareCategory(
  cases: readonly LoadedCase[],
  options: CompareRunOptions = {},
): Promise<CategoryComparison> {
  const { logger, delay } = runContext(options);
  const jev = createCategoryAgent({
    backend: 'jev',
    ...(options.threshold !== undefined ? { threshold: options.threshold } : {}),
    logger,
  });
  const llm = createCategoryAgent({ backend: 'llm', logger });
  const rows: CategoryRow[] = [];

  for (const item of cases) {
    try {
      const jevCategory = await jev.classifyCategory(item.entry);
      await sleep(delay);
      const llmCategory = await llm.classifyCategory(item.entry);
      await sleep(delay);
      rows.push({
        id: item.entry.id,
        jev: jevCategory,
        llm: llmCategory,
        agree: jevCategory === llmCategory,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('skipping post: category failed', {
        id: item.entry.id,
        error: message,
      });
    }
  }

  return {
    rows,
    agreement: agreement(
      rows.map((row) => row.jev),
      rows.map((row) => row.llm),
    ),
  };
}

/** Format a ratio as a percentage with one decimal. */
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Format a boolean as `yes`/`no`. */
function boolLabel(value: boolean): string {
  return value ? 'yes' : 'no';
}

/** Render a confusion matrix as a compact one-liner. */
function formatMatrix(matrix: ConfusionMatrix): string {
  return `TP=${matrix.tp} FP=${matrix.fp} TN=${matrix.tn} FN=${matrix.fn}`;
}

/** Render the `filter` comparison as an array of log lines. */
export function renderFilterReport(result: FilterComparison): string[] {
  const lines: string[] = ['filter: per-post verdicts (expected vs jev / llm)'];
  lines.push('id | expected | jev | jev prob | llm | jev ok | llm ok');
  for (const row of result.rows) {
    const probability =
      row.jevProbability === undefined ? '-' : row.jevProbability.toFixed(3);
    lines.push(
      `${row.id} | ${boolLabel(row.expected)} | ${boolLabel(row.jevRelevant)} | ${probability} | ${boolLabel(row.llmVerdict)} | ${boolLabel(row.jevMatches)} | ${boolLabel(row.llmMatches)}`,
    );
  }
  lines.push('');
  lines.push(
    `jev accuracy ${formatPercent(result.jev.accuracy)} (${formatMatrix(result.jev.matrix)})`,
  );
  lines.push(
    `llm accuracy ${formatPercent(result.llm.accuracy)} (${formatMatrix(result.llm.matrix)})`,
  );
  lines.push(`agreement jev vs llm ${formatPercent(result.agreement)}`);

  if (
    result.sweep !== undefined &&
    result.bestByAccuracy !== undefined &&
    result.bestByF1 !== undefined
  ) {
    lines.push('');
    lines.push('threshold sweep (recomputed from saved jev probabilities):');
    for (const score of result.sweep) {
      lines.push(
        `  t=${score.threshold.toFixed(2)} accuracy=${formatPercent(score.accuracy)} f1=${formatPercent(score.f1)} (${formatMatrix(score.matrix)})`,
      );
    }
    lines.push(
      `best by accuracy: t=${result.bestByAccuracy.threshold.toFixed(2)} ` +
        `(accuracy ${formatPercent(result.bestByAccuracy.accuracy)}, f1 ${formatPercent(result.bestByAccuracy.f1)})`,
    );
    lines.push(
      `best by f1: t=${result.bestByF1.threshold.toFixed(2)} ` +
        `(f1 ${formatPercent(result.bestByF1.f1)}, accuracy ${formatPercent(result.bestByF1.accuracy)})`,
    );
  }

  return lines;
}

/** Render the `match` comparison as an array of log lines. */
export function renderMatchReport(result: MatchComparison): string[] {
  const lines: string[] = ['match: per-post decisions (jev vs llm)'];
  lines.push('id | jev | llm | agree');
  for (const row of result.rows) {
    lines.push(
      `${row.id} | ${matchLabel(row.jev)} | ${matchLabel(row.llm)} | ${boolLabel(row.agree)}`,
    );
  }
  lines.push('');
  lines.push(`agreement jev vs llm ${formatPercent(result.agreement)}`);
  return lines;
}

/** Render the `category` comparison as an array of log lines. */
export function renderCategoryReport(result: CategoryComparison): string[] {
  const lines: string[] = ['category: per-post categories (jev vs llm)'];
  lines.push('id | jev | llm | agree');
  for (const row of result.rows) {
    lines.push(
      `${row.id} | ${row.jev} | ${row.llm} | ${boolLabel(row.agree)}`,
    );
  }
  lines.push('');
  lines.push(`agreement jev vs llm ${formatPercent(result.agreement)}`);
  return lines;
}
