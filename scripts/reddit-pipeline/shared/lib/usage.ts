import type { ModelUsage } from './types';

/** Accumulated usage of one agent across a run. */
export interface UsageTotals {
  /** Number of model calls. */
  calls: number;

  /** Total input (prompt) tokens. */
  inputTokens: number;

  /** Total output (completion) tokens. */
  outputTokens: number;

  /** Total cost in USD. */
  cost: number;
}

/** A zeroed usage accumulator. */
export function emptyUsage(): UsageTotals {
  return { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
}

/** Add a single model call to an accumulator. */
export function addUsage(totals: UsageTotals, usage: ModelUsage): UsageTotals {
  return {
    calls: totals.calls + 1,
    inputTokens: totals.inputTokens + usage.inputTokens,
    outputTokens: totals.outputTokens + usage.outputTokens,
    cost: totals.cost + (usage.cost ?? 0),
  };
}

/** Merge two accumulators into a new one. */
export function mergeUsage(a: UsageTotals, b: UsageTotals): UsageTotals {
  return {
    calls: a.calls + b.calls,
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cost: a.cost + b.cost,
  };
}

/** Options accepted by {@link createUsageTracker}. */
export interface UsageTrackerOptions {
  /**
   * Resolve the cost of a call when the reported usage does not carry one
   * (e.g. LLM calls, whose provider only reports tokens).
   */
  costOf?: (agent: string, usage: ModelUsage) => number;
}

/** Accumulates model usage per agent. */
export interface UsageTracker {
  /** Record a single model call of `agent`. */
  record(agent: string, usage: ModelUsage): void;

  /** Snapshot of the accumulated totals, keyed by agent. */
  totals(): Record<string, UsageTotals>;
}

/** Create an in-memory usage tracker. */
export function createUsageTracker(
  options: UsageTrackerOptions = {},
): UsageTracker {
  const byAgent = new Map<string, UsageTotals>();

  return {
    record: (agent, usage): void => {
      const cost = usage.cost ?? options.costOf?.(agent, usage) ?? 0;
      const current = byAgent.get(agent) ?? emptyUsage();
      byAgent.set(agent, addUsage(current, { ...usage, cost }));
    },
    totals: (): Record<string, UsageTotals> => {
      const result: Record<string, UsageTotals> = {};
      for (const [agent, totals] of byAgent) {
        result[agent] = totals;
      }
      return result;
    },
  };
}
