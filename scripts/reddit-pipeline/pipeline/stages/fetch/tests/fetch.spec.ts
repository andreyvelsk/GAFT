import { describe, expect, it } from 'vitest';

import type { RawPost } from '../../../../shared/lib/types';
import { runFetchStage } from '../index';

/** Fixed reference time used to keep the window deterministic. */
const NOW = new Date('2026-01-01T12:00:00.000Z');

/** Build a raw post with sensible defaults plus overrides. */
function rawPost(overrides: Partial<RawPost> = {}): RawPost {
  return {
    id: 'abc',
    title: 'I built a dual screen app',
    author: 'someone',
    created_utc: 1700000000,
    permalink: '/r/AynThor/comments/abc/',
    selftext: 'Check it out https://github.com/me/app',
    url: 'https://github.com/me/app',
    ...overrides,
  };
}

describe('runFetchStage', () => {
  it('computes the window from the lookback hours', async () => {
    const result = await runFetchStage({
      subreddit: 'AynThor',
      lookbackHours: 24,
      maxPosts: 0,
      now: NOW,
      fetchPosts: () => Promise.resolve([]),
    });

    const before = Math.floor(NOW.getTime() / 1000);
    expect(result.window).toEqual({
      subreddit: 'AynThor',
      after: before - 24 * 3600,
      before,
    });
  });

  it('normalizes posts and splits them by the prefilter', async () => {
    const result = await runFetchStage({
      now: NOW,
      fetchPosts: () =>
        Promise.resolve([
          rawPost({ id: 'keep' }),
          rawPost({ id: 'drop', link_flair_text: 'Support' }),
        ]),
    });

    expect(result.fetched).toBe(2);
    expect(result.entries.map((entry) => entry.id)).toEqual(['keep']);
    expect(result.dropped).toHaveLength(1);
    expect(result.dropped[0]?.entry.id).toBe('drop');
    expect(result.dropped[0]?.reason).toBe('flair=support');
  });

  it('keeps every post (no drops) when the prefilter is disabled', async () => {
    const result = await runFetchStage({
      now: NOW,
      prefilter: false,
      fetchPosts: () =>
        Promise.resolve([
          rawPost({ id: 'keep' }),
          rawPost({ id: 'drop', link_flair_text: 'Support' }),
        ]),
    });

    expect(result.entries.map((entry) => entry.id)).toEqual(['keep', 'drop']);
    expect(result.dropped).toHaveLength(0);
  });

  it('applies the maxPosts limit to the kept posts', async () => {
    const result = await runFetchStage({
      now: NOW,
      maxPosts: 1,
      fetchPosts: () =>
        Promise.resolve([
          rawPost({ id: 'one' }),
          rawPost({ id: 'two' }),
          rawPost({ id: 'three' }),
        ]),
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]?.id).toBe('one');
  });

  it('keeps every post when maxPosts is zero', async () => {
    const result = await runFetchStage({
      now: NOW,
      maxPosts: 0,
      fetchPosts: () =>
        Promise.resolve([rawPost({ id: 'one' }), rawPost({ id: 'two' })]),
    });

    expect(result.entries).toHaveLength(2);
  });
});
