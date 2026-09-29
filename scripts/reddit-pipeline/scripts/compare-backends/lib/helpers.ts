import type {
  AgentKind,
  BackendMetrics,
  CliArgs,
  ConfusionMatrix,
  LabeledPrediction,
  ProbabilityPoint,
  ThresholdScore,
} from './types';

/** Default lower bound of the threshold sweep. */
export const DEFAULT_THRESHOLD_START = 0.5;

/** Default upper bound of the threshold sweep. */
export const DEFAULT_THRESHOLD_END = 0.9;

/** Default step of the threshold sweep. */
export const DEFAULT_THRESHOLD_STEP = 0.05;

/** Build a confusion matrix (positive = relevant) from labelled predictions. */
export function confusionMatrix(
  rows: readonly LabeledPrediction[],
): ConfusionMatrix {
  const matrix: ConfusionMatrix = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const row of rows) {
    if (row.expected && row.predicted) {
      matrix.tp += 1;
    } else if (!row.expected && row.predicted) {
      matrix.fp += 1;
    } else if (!row.expected && !row.predicted) {
      matrix.tn += 1;
    } else {
      matrix.fn += 1;
    }
  }
  return matrix;
}

/** Share of correct predictions; 0 for an empty matrix. */
export function accuracy(matrix: ConfusionMatrix): number {
  const total = matrix.tp + matrix.fp + matrix.tn + matrix.fn;
  return total === 0 ? 0 : (matrix.tp + matrix.tn) / total;
}

/** Precision `tp / (tp + fp)`; 0 when no positive prediction was made. */
export function precision(matrix: ConfusionMatrix): number {
  const denominator = matrix.tp + matrix.fp;
  return denominator === 0 ? 0 : matrix.tp / denominator;
}

/** Recall `tp / (tp + fn)`; 0 when there is nothing positive to find. */
export function recall(matrix: ConfusionMatrix): number {
  const denominator = matrix.tp + matrix.fn;
  return denominator === 0 ? 0 : matrix.tp / denominator;
}

/** Harmonic mean of precision and recall; 0 when both are undefined. */
export function f1(matrix: ConfusionMatrix): number {
  const denominator = 2 * matrix.tp + matrix.fp + matrix.fn;
  return denominator === 0 ? 0 : (2 * matrix.tp) / denominator;
}

/** Aggregate a confusion matrix and the derived metrics. */
export function evaluate(rows: readonly LabeledPrediction[]): BackendMetrics {
  const matrix = confusionMatrix(rows);
  return {
    matrix,
    accuracy: accuracy(matrix),
    precision: precision(matrix),
    recall: recall(matrix),
    f1: f1(matrix),
  };
}

/**
 * Share of positions where two arrays are equal (`Object.is`), compared up to
 * the shorter length; 0 when either array is empty.
 */
export function agreement<T>(
  left: readonly T[],
  right: readonly T[],
): number {
  const length = Math.min(left.length, right.length);
  if (length === 0) {
    return 0;
  }
  let matches = 0;
  for (let index = 0; index < length; index += 1) {
    if (Object.is(left[index], right[index])) {
      matches += 1;
    }
  }
  return matches / length;
}

/** Predict relevance: a probability at or above the threshold is relevant. */
export function predictAtThreshold(
  probability: number,
  threshold: number,
): boolean {
  return probability >= threshold;
}

/** Score the saved probabilities at a single threshold. */
export function scoreAtThreshold(
  points: readonly ProbabilityPoint[],
  threshold: number,
): ThresholdScore {
  const rows: LabeledPrediction[] = points.map((point) => ({
    id: point.id,
    expected: point.expected,
    predicted: predictAtThreshold(point.probability, threshold),
  }));
  return { threshold, ...evaluate(rows) };
}

/** Score the saved probabilities at every threshold of the grid. */
export function thresholdScores(
  points: readonly ProbabilityPoint[],
  thresholds: readonly number[],
): ThresholdScore[] {
  return thresholds.map((threshold) => scoreAtThreshold(points, threshold));
}

/**
 * Build the threshold grid from `start` to `end` inclusive. Values are rounded
 * to two decimals to avoid floating-point drift (`0.5`, `0.55`, …, `0.9`).
 */
export function thresholdGrid(
  start: number = DEFAULT_THRESHOLD_START,
  end: number = DEFAULT_THRESHOLD_END,
  step: number = DEFAULT_THRESHOLD_STEP,
): number[] {
  if (step <= 0) {
    throw new RangeError('threshold step must be greater than 0');
  }
  if (end < start) {
    return [];
  }
  const steps = Math.round((end - start) / step);
  const grid: number[] = [];
  for (let index = 0; index <= steps; index += 1) {
    grid.push(Number((start + index * step).toFixed(2)));
  }
  return grid;
}

/** Whether `candidate` beats `current` on accuracy, then F1, then lower threshold. */
function betterByAccuracy(
  candidate: ThresholdScore,
  current: ThresholdScore,
): boolean {
  if (candidate.accuracy !== current.accuracy) {
    return candidate.accuracy > current.accuracy;
  }
  if (candidate.f1 !== current.f1) {
    return candidate.f1 > current.f1;
  }
  return candidate.threshold < current.threshold;
}

/** Whether `candidate` beats `current` on F1, then accuracy, then lower threshold. */
function betterByF1(
  candidate: ThresholdScore,
  current: ThresholdScore,
): boolean {
  if (candidate.f1 !== current.f1) {
    return candidate.f1 > current.f1;
  }
  if (candidate.accuracy !== current.accuracy) {
    return candidate.accuracy > current.accuracy;
  }
  return candidate.threshold < current.threshold;
}

/** Pick the score preferred by `better`, or `undefined` for an empty input. */
function pickBest(
  scores: readonly ThresholdScore[],
  better: (candidate: ThresholdScore, current: ThresholdScore) => boolean,
): ThresholdScore | undefined {
  let best: ThresholdScore | undefined;
  for (const score of scores) {
    if (best === undefined || better(score, best)) {
      best = score;
    }
  }
  return best;
}

/** Optimal threshold by accuracy (ties broken by F1, then lower threshold). */
export function bestByAccuracy(
  scores: readonly ThresholdScore[],
): ThresholdScore | undefined {
  return pickBest(scores, betterByAccuracy);
}

/** Optimal threshold by F1 (ties broken by accuracy, then lower threshold). */
export function bestByF1(
  scores: readonly ThresholdScore[],
): ThresholdScore | undefined {
  return pickBest(scores, betterByF1);
}

/** Parse a decimal argument raw value, rejecting blanks and non-numbers. */
function parseDecimal(raw: string): number {
  return raw.trim() === '' ? Number.NaN : Number(raw);
}

/** Parse an integer argument raw value, rejecting blanks and non-integers. */
function parseInteger(raw: string): number {
  return raw.trim() === '' ? Number.NaN : Number(raw);
}

/**
 * Parse the CLI arguments of the harness. Accepts `--agent=filter|match|category`,
 * `--threshold=<0..1>` and `--limit=<positive integer>`; anything else throws.
 */
export function parseArgs(argv: readonly string[]): CliArgs {
  let agent: AgentKind = 'filter';
  let threshold: number | undefined;
  let limit: number | undefined;

  for (const arg of argv) {
    if (arg.startsWith('--agent=')) {
      const value = arg.slice('--agent='.length);
      if (value !== 'filter' && value !== 'match' && value !== 'category') {
        throw new Error(
          `unknown agent "${value}" (expected filter|match|category)`,
        );
      }
      agent = value;
    } else if (arg.startsWith('--threshold=')) {
      const parsed = parseDecimal(arg.slice('--threshold='.length));
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
        throw new Error('--threshold must be a number between 0 and 1');
      }
      threshold = parsed;
    } else if (arg.startsWith('--limit=')) {
      const parsed = parseInteger(arg.slice('--limit='.length));
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error('--limit must be a positive integer');
      }
      limit = parsed;
    } else {
      throw new Error(`unknown argument "${arg}"`);
    }
  }

  return {
    agent,
    ...(threshold !== undefined ? { threshold } : {}),
    ...(limit !== undefined ? { limit } : {}),
  };
}
