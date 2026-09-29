import { describe, expect, it } from 'vitest';

import type { MatchDecision, MatchOptions } from '../../../../agents/match';
import type { ReportEntry } from '../../../../shared/lib/types';
import { runMatchStage } from '../index';

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

describe('runMatchStage', () => {
  it('returns a decision per post, preserving the input order', async () => {
    const entries = [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })];
    const match = (
      entry: ReportEntry,
      _options: MatchOptions,
    ): Promise<MatchDecision> =>
      Promise.resolve({
        action: entry.id === 'a' ? 'CREATE' : 'UPDATE',
        slug: entry.id,
      });

    const result = await runMatchStage(entries, { match });

    expect(result.decisions.map((item) => item.entry.id)).toEqual(['a', 'b']);
    expect(result.decisions[0]?.decision.action).toBe('CREATE');
    expect(result.decisions[1]?.decision.action).toBe('UPDATE');
  });

  it('forwards the match options to the matcher', async () => {
    const calls: MatchOptions[] = [];
    const match = (
      _entry: ReportEntry,
      options: MatchOptions,
    ): Promise<MatchDecision> => {
      calls.push(options);
      return Promise.resolve({ action: 'CREATE', slug: 'x' });
    };

    await runMatchStage([makeEntry()], {
      match,
      matchOptions: { contentDir: '/tmp/content' },
    });

    expect(calls[0]?.contentDir).toBe('/tmp/content');
  });

  it('returns no decisions for an empty input', async () => {
    const result = await runMatchStage([]);
    expect(result.decisions).toEqual([]);
  });
});
