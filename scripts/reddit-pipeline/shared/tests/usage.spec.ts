import { describe, expect, it } from 'vitest';

import {
  addUsage,
  createUsageTracker,
  emptyUsage,
  mergeUsage,
} from '../lib/usage';

describe('emptyUsage', () => {
  it('returns a zeroed accumulator', () => {
    expect(emptyUsage()).toEqual({
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
    });
  });
});

describe('addUsage', () => {
  it('increments the call count and sums the tokens and cost', () => {
    const totals = addUsage(emptyUsage(), {
      inputTokens: 10,
      outputTokens: 5,
      cost: 0.01,
    });

    expect(totals).toEqual({
      calls: 1,
      inputTokens: 10,
      outputTokens: 5,
      cost: 0.01,
    });
  });

  it('treats a missing cost as zero', () => {
    const totals = addUsage(emptyUsage(), {
      inputTokens: 1,
      outputTokens: 1,
    });

    expect(totals.cost).toBe(0);
  });
});

describe('mergeUsage', () => {
  it('sums two accumulators', () => {
    const merged = mergeUsage(
      { calls: 1, inputTokens: 10, outputTokens: 5, cost: 0.01 },
      { calls: 2, inputTokens: 20, outputTokens: 10, cost: 0.02 },
    );

    expect(merged).toEqual({
      calls: 3,
      inputTokens: 30,
      outputTokens: 15,
      cost: 0.03,
    });
  });
});

describe('createUsageTracker', () => {
  it('accumulates usage per agent', () => {
    const tracker = createUsageTracker();
    tracker.record('filter', { inputTokens: 10, outputTokens: 5, cost: 0.01 });
    tracker.record('filter', { inputTokens: 1, outputTokens: 1, cost: 0.001 });
    tracker.record('create', { inputTokens: 100, outputTokens: 50, cost: 0.5 });

    expect(tracker.totals()).toEqual({
      filter: { calls: 2, inputTokens: 11, outputTokens: 6, cost: 0.011 },
      create: { calls: 1, inputTokens: 100, outputTokens: 50, cost: 0.5 },
    });
  });

  it('estimates the cost through costOf when the usage has none', () => {
    const tracker = createUsageTracker({
      costOf: (_agent, usage): number => usage.inputTokens * 0.001,
    });
    tracker.record('match', { inputTokens: 200, outputTokens: 0 });

    expect(tracker.totals().match).toEqual({
      calls: 1,
      inputTokens: 200,
      outputTokens: 0,
      cost: 0.2,
    });
  });

  it('prefers a reported cost over costOf', () => {
    const tracker = createUsageTracker({
      costOf: (): number => 999,
    });
    tracker.record('filter', { inputTokens: 1, outputTokens: 1, cost: 0.5 });

    expect(tracker.totals().filter?.cost).toBe(0.5);
  });

  it('returns an empty map when nothing was recorded', () => {
    expect(createUsageTracker().totals()).toEqual({});
  });
});
