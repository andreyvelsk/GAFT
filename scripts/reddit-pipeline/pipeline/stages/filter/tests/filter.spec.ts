import { describe, expect, it } from 'vitest';

import type { FilterOptions, FilterVerdicts } from '../../../../agents/filter';
import type { ReportEntry } from '../../../../shared/lib/types';
import { runFilterStage } from '../index';

/** Build a report entry with sensible defaults plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'a',
    title: 'Post A',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/a/',
    selftext: '',
    external_url: '',
    flair: '',
    images: [],
    ...overrides,
  };
}

describe('runFilterStage', () => {
  it('returns empty results for no entries without calling the classifier', async () => {
    let called = false;
    const classify = (
      _entries: readonly ReportEntry[],
      _options: FilterOptions,
    ): Promise<FilterVerdicts> => {
      called = true;
      return Promise.resolve([]);
    };

    const result = await runFilterStage([], { classify });

    expect(result).toEqual({ relevant: [], skipped: [] });
    expect(called).toBe(false);
  });

  it('splits the posts into relevant and skipped', async () => {
    const entries = [
      makeEntry({ id: 'a' }),
      makeEntry({ id: 'b' }),
      makeEntry({ id: 'c' }),
    ];
    const classify = (
      input: readonly ReportEntry[],
      _options: FilterOptions,
    ): Promise<FilterVerdicts> =>
      Promise.resolve(
        input.map((entry) => ({ id: entry.id, relevant: entry.id !== 'b' })),
      );

    const result = await runFilterStage(entries, { classify });

    expect(result.relevant.map((entry) => entry.id)).toEqual(['a', 'c']);
    expect(result.skipped.map((item) => item.entry.id)).toEqual(['b']);
    expect(result.skipped[0]?.reason).toBe('not relevant');
  });

  it('forwards the batch size to the classifier', async () => {
    const calls: FilterOptions[] = [];
    const classify = (
      input: readonly ReportEntry[],
      options: FilterOptions,
    ): Promise<FilterVerdicts> => {
      calls.push(options);
      return Promise.resolve(
        input.map((entry) => ({ id: entry.id, relevant: true })),
      );
    };

    await runFilterStage([makeEntry()], { classify, batchSize: 3 });

    expect(calls[0]?.batchSize).toBe(3);
  });

  it('treats a missing verdict as not relevant', async () => {
    const classify = (): Promise<FilterVerdicts> => Promise.resolve([]);

    const result = await runFilterStage([makeEntry({ id: 'a' })], { classify });

    expect(result.relevant).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
  });
});
