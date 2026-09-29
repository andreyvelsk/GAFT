import { describe, expect, it } from 'vitest';

import {
  accuracy,
  agreement,
  bestByAccuracy,
  bestByF1,
  confusionMatrix,
  evaluate,
  f1,
  parseArgs,
  predictAtThreshold,
  precision,
  recall,
  scoreAtThreshold,
  thresholdGrid,
  thresholdScores,
} from '../lib/helpers';
import type { LabeledPrediction, ProbabilityPoint } from '../lib/types';

/** Build a labelled prediction row. */
function prediction(
  expected: boolean,
  predicted: boolean,
  id = 'x',
): LabeledPrediction {
  return { id, expected, predicted };
}

/** Build a probability point. */
function point(
  id: string,
  expected: boolean,
  probability: number,
): ProbabilityPoint {
  return { id, expected, probability };
}

describe('confusionMatrix', () => {
  it('returns an all-zero matrix for an empty input', () => {
    expect(confusionMatrix([])).toEqual({ tp: 0, fp: 0, tn: 0, fn: 0 });
  });

  it('counts every error class exactly once', () => {
    const matrix = confusionMatrix([
      prediction(true, true, 'tp'),
      prediction(false, true, 'fp'),
      prediction(false, false, 'tn'),
      prediction(true, false, 'fn'),
    ]);

    expect(matrix).toEqual({ tp: 1, fp: 1, tn: 1, fn: 1 });
  });

  it('accumulates repeated classes', () => {
    const matrix = confusionMatrix([
      prediction(true, true),
      prediction(true, true),
      prediction(false, true),
      prediction(false, false),
      prediction(false, false),
      prediction(false, false),
    ]);

    expect(matrix).toEqual({ tp: 2, fp: 1, tn: 3, fn: 0 });
  });
});

describe('accuracy', () => {
  it('is 0 for an empty matrix', () => {
    expect(accuracy({ tp: 0, fp: 0, tn: 0, fn: 0 })).toBe(0);
  });

  it('is 1 when every prediction is correct', () => {
    expect(accuracy({ tp: 3, fp: 0, tn: 2, fn: 0 })).toBe(1);
  });

  it('is the share of correct predictions', () => {
    expect(accuracy({ tp: 1, fp: 1, tn: 1, fn: 1 })).toBe(0.5);
  });
});

describe('precision / recall / f1', () => {
  it('are 0 when their denominator is undefined', () => {
    expect(precision({ tp: 0, fp: 0, tn: 1, fn: 1 })).toBe(0);
    expect(recall({ tp: 0, fp: 1, tn: 1, fn: 0 })).toBe(0);
    expect(f1({ tp: 0, fp: 0, tn: 1, fn: 1 })).toBe(0);
  });

  it('compute precision, recall and their harmonic mean', () => {
    const matrix = { tp: 1, fp: 1, tn: 0, fn: 1 };

    expect(precision(matrix)).toBe(0.5);
    expect(recall(matrix)).toBe(0.5);
    expect(f1(matrix)).toBe(0.5);
  });

  it('rewards a perfect classifier with 1', () => {
    const matrix = { tp: 2, fp: 0, tn: 1, fn: 0 };

    expect(precision(matrix)).toBe(1);
    expect(recall(matrix)).toBe(1);
    expect(f1(matrix)).toBe(1);
  });
});

describe('evaluate', () => {
  it('aggregates an empty input into zeroed metrics', () => {
    expect(evaluate([])).toEqual({
      matrix: { tp: 0, fp: 0, tn: 0, fn: 0 },
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
    });
  });

  it('aggregates a mixed input', () => {
    const metrics = evaluate([
      prediction(true, true),
      prediction(true, false),
      prediction(false, false),
    ]);

    expect(metrics.matrix).toEqual({ tp: 1, fp: 0, tn: 1, fn: 1 });
    expect(metrics.accuracy).toBeCloseTo(2 / 3);
    expect(metrics.precision).toBe(1);
    expect(metrics.recall).toBe(0.5);
    expect(metrics.f1).toBeCloseTo(2 / 3);
  });
});

describe('agreement', () => {
  it('is 0 when either array is empty', () => {
    expect(agreement([], [])).toBe(0);
    expect(agreement([true], [])).toBe(0);
  });

  it('is 1 for identical arrays', () => {
    expect(agreement([true, false, true], [true, false, true])).toBe(1);
  });

  it('is the share of matching positions', () => {
    expect(agreement([true, false, true, false], [true, true, false, false])).toBe(
      0.5,
    );
  });

  it('compares up to the shorter length', () => {
    expect(agreement([true, false], [true, false, true])).toBe(1);
  });

  it('treats NaN values as equal via Object.is', () => {
    expect(agreement([Number.NaN], [Number.NaN])).toBe(1);
  });

  it('compares generic labels', () => {
    expect(agreement(['a', 'b'], ['a', 'c'])).toBe(0.5);
  });
});

describe('predictAtThreshold', () => {
  it('marks a probability at the threshold as relevant', () => {
    expect(predictAtThreshold(0.8, 0.8)).toBe(true);
  });

  it('marks a probability below the threshold as not relevant', () => {
    expect(predictAtThreshold(0.79, 0.8)).toBe(false);
  });

  it('marks a probability above the threshold as relevant', () => {
    expect(predictAtThreshold(0.81, 0.8)).toBe(true);
  });
});

describe('thresholdGrid', () => {
  it('produces the default 0.5..0.9 grid in steps of 0.05', () => {
    const grid = thresholdGrid();

    expect(grid).toHaveLength(9);
    expect(grid[0]).toBe(0.5);
    expect(grid[8]).toBe(0.9);
    expect(grid[1]).toBe(0.55);
  });

  it('honours a custom start, end and step', () => {
    expect(thresholdGrid(0.5, 0.6, 0.05)).toEqual([0.5, 0.55, 0.6]);
  });

  it('returns an empty grid when the end precedes the start', () => {
    expect(thresholdGrid(0.9, 0.5, 0.05)).toEqual([]);
  });

  it('throws on a non-positive step', () => {
    expect(() => thresholdGrid(0.5, 0.9, 0)).toThrow(RangeError);
    expect(() => thresholdGrid(0.5, 0.9, -0.1)).toThrow(RangeError);
  });
});

describe('scoreAtThreshold', () => {
  it('scores an empty input into zeroed metrics', () => {
    const score = scoreAtThreshold([], 0.8);

    expect(score.threshold).toBe(0.8);
    expect(score.matrix).toEqual({ tp: 0, fp: 0, tn: 0, fn: 0 });
    expect(score.accuracy).toBe(0);
    expect(score.f1).toBe(0);
  });

  it('uses an inclusive boundary (probability === threshold is positive)', () => {
    const score = scoreAtThreshold([point('a', true, 0.8)], 0.8);

    expect(score.matrix).toEqual({ tp: 1, fp: 0, tn: 0, fn: 0 });
    expect(score.accuracy).toBe(1);
  });

  it('classifies below the threshold as negative', () => {
    const score = scoreAtThreshold([point('a', false, 0.79)], 0.8);

    expect(score.matrix).toEqual({ tp: 0, fp: 0, tn: 1, fn: 0 });
  });
});

describe('thresholdScores', () => {
  it('returns one score per threshold, in order', () => {
    const scores = thresholdScores(
      [point('a', true, 0.9), point('b', false, 0.4)],
      [0.5, 0.95],
    );

    expect(scores).toHaveLength(2);
    expect(scores[0]?.threshold).toBe(0.5);
    expect(scores[1]?.threshold).toBe(0.95);
    // At 0.5 both are classified correctly (TP + TN).
    expect(scores[0]?.matrix).toEqual({ tp: 1, fp: 0, tn: 1, fn: 0 });
    expect(scores[0]?.accuracy).toBe(1);
    // At 0.95 the positive post drops to FN while the negative stays TN.
    expect(scores[1]?.matrix).toEqual({ tp: 0, fp: 0, tn: 1, fn: 1 });
    expect(scores[1]?.accuracy).toBe(0.5);
  });

  it('returns an empty list for no thresholds', () => {
    expect(thresholdScores([point('a', true, 0.9)], [])).toEqual([]);
  });
});

describe('bestByAccuracy / bestByF1', () => {
  it('return undefined for an empty sweep', () => {
    expect(bestByAccuracy([])).toBeUndefined();
    expect(bestByF1([])).toBeUndefined();
  });

  it('pick the threshold with the highest accuracy', () => {
    // At 0.5 both are positive (one TP, one FP); at 0.75 both are negative
    // (one FN, one TN). Accuracy ties at 0.5 but the F1 tie-break prefers 0.5.
    const points = [point('pos', true, 0.6), point('neg', false, 0.7)];
    const scores = thresholdScores(points, [0.5, 0.65, 0.75]);

    expect(bestByAccuracy(scores)?.threshold).toBe(0.5);
    expect(bestByF1(scores)?.threshold).toBe(0.5);
  });

  it('break an exact tie towards the lower threshold', () => {
    const points = [
      point('a', true, 0.8),
      point('b', false, 0.2),
      point('c', true, 0.7),
    ];
    const scores = thresholdScores(points, [0.5, 0.65, 0.7]);

    expect(scores.every((score) => score.accuracy === 1)).toBe(true);
    expect(bestByAccuracy(scores)?.threshold).toBe(0.5);
    expect(bestByF1(scores)?.threshold).toBe(0.5);
  });

  it('prefer the higher F1 when accuracies tie', () => {
    const scores = thresholdScores(
      [point('pos', true, 0.6), point('neg', false, 0.4)],
      [0.5],
    );
    const base = scores[0];
    if (base === undefined) {
      throw new Error('expected a score');
    }

    const tiedButWeaker: typeof base = { ...base, threshold: 0.7, f1: 0 };
    const best = bestByAccuracy([base, tiedButWeaker]);

    expect(best?.threshold).toBe(0.5);
  });

  it('prefer the higher accuracy when F1s tie', () => {
    const scores = thresholdScores(
      [point('a', true, 0.8), point('b', false, 0.3)],
      [0.5],
    );
    const base = scores[0];
    if (base === undefined) {
      throw new Error('expected a score');
    }

    const tiedButWeaker: typeof base = { ...base, threshold: 0.7, accuracy: 0 };
    const best = bestByF1([base, tiedButWeaker]);

    expect(best?.threshold).toBe(0.5);
  });
});

describe('parseArgs', () => {
  it('defaults to the filter agent without options', () => {
    expect(parseArgs([])).toEqual({ agent: 'filter' });
  });

  it('parses a valid agent', () => {
    expect(parseArgs(['--agent=match'])).toEqual({ agent: 'match' });
    expect(parseArgs(['--agent=category'])).toEqual({ agent: 'category' });
  });

  it('parses a threshold', () => {
    expect(parseArgs(['--threshold=0.65'])).toEqual({
      agent: 'filter',
      threshold: 0.65,
    });
  });

  it('parses a limit', () => {
    expect(parseArgs(['--limit=3'])).toEqual({ agent: 'filter', limit: 3 });
  });

  it('combines several flags', () => {
    expect(parseArgs(['--agent=filter', '--threshold=0.5', '--limit=2'])).toEqual({
      agent: 'filter',
      threshold: 0.5,
      limit: 2,
    });
  });

  it('rejects an unknown agent', () => {
    expect(() => parseArgs(['--agent=nope'])).toThrow(/unknown agent/);
  });

  it('rejects an out-of-range or non-numeric threshold', () => {
    expect(() => parseArgs(['--threshold=1.5'])).toThrow(/--threshold/);
    expect(() => parseArgs(['--threshold=-0.1'])).toThrow(/--threshold/);
    expect(() => parseArgs(['--threshold=abc'])).toThrow(/--threshold/);
    expect(() => parseArgs(['--threshold='])).toThrow(/--threshold/);
  });

  it('accepts the threshold boundaries', () => {
    expect(parseArgs(['--threshold=0']).threshold).toBe(0);
    expect(parseArgs(['--threshold=1']).threshold).toBe(1);
  });

  it('rejects a non-positive or non-integer limit', () => {
    expect(() => parseArgs(['--limit=0'])).toThrow(/--limit/);
    expect(() => parseArgs(['--limit=-2'])).toThrow(/--limit/);
    expect(() => parseArgs(['--limit=2.5'])).toThrow(/--limit/);
    expect(() => parseArgs(['--limit=abc'])).toThrow(/--limit/);
    expect(() => parseArgs(['--limit='])).toThrow(/--limit/);
  });

  it('rejects an unknown argument', () => {
    expect(() => parseArgs(['--wat=1'])).toThrow(/unknown argument/);
    expect(() => parseArgs(['positional'])).toThrow(/unknown argument/);
  });
});
