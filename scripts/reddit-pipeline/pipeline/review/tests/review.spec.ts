import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  emptyReviewLedger,
  formatReviewMarkdown,
  loadReviewLedger,
  markReviewApproved,
  markReviewFailed,
  markReviewRejected,
  mergeReviewPosts,
  pruneReviewLedger,
  saveReviewLedger,
  type ReviewCandidate,
  type ReviewLedger,
} from '../index';

/** Fixed clock used to keep the ledger timestamps deterministic. */
const NOW = new Date('2026-01-01T00:00:00.000Z');
const clock = (): Date => NOW;

/** Build a review candidate with sensible defaults plus overrides. */
function candidate(
  id: string,
  overrides: Partial<ReviewCandidate> = {},
): ReviewCandidate {
  return {
    id,
    title: `Post ${id}`,
    permalink: `https://www.reddit.com/r/AynThor/comments/${id}/`,
    createdUtc: 1700000000,
    ...overrides,
  };
}

describe('loadReviewLedger', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('returns an empty ledger when the file does not exist', async () => {
    dir = await mkdtemp(join(tmpdir(), 'review-'));
    const ledger = await loadReviewLedger({ path: join(dir, 'missing.json') });

    expect(ledger).toEqual(emptyReviewLedger());
  });

  it('round-trips a ledger written by saveReviewLedger', async () => {
    dir = await mkdtemp(join(tmpdir(), 'review-'));
    const path = join(dir, 'review.json');
    const ledger = mergeReviewPosts(emptyReviewLedger(), [candidate('a')], {
      now: clock,
    });

    await saveReviewLedger(ledger, {
      path,
      markdownPath: join(dir, 'review.md'),
    });
    const loaded = await loadReviewLedger({ path });

    expect(loaded).toEqual(ledger);
  });

  it('drops entries with an invalid shape', async () => {
    dir = await mkdtemp(join(tmpdir(), 'review-'));
    const path = join(dir, 'review.json');
    const valid = mergeReviewPosts(emptyReviewLedger(), [candidate('a')], {
      now: clock,
    }).posts[0];
    await writeFile(
      path,
      JSON.stringify({ posts: [valid, { id: 'bad' }] }),
      'utf8',
    );

    const loaded = await loadReviewLedger({ path });

    expect(loaded.posts.map((post) => post.id)).toEqual(['a']);
  });
});

describe('mergeReviewPosts', () => {
  it('appends a new post as pending with firstSeenAt', () => {
    const ledger = mergeReviewPosts(emptyReviewLedger(), [candidate('a')], {
      now: clock,
    });

    expect(ledger.posts).toEqual([
      {
        id: 'a',
        title: 'Post a',
        permalink: 'https://www.reddit.com/r/AynThor/comments/a/',
        createdUtc: 1700000000,
        firstSeenAt: NOW.toISOString(),
        status: 'pending',
      },
    ]);
  });

  it('never overwrites a decision and refreshes title/permalink', () => {
    const decided = markReviewApproved(
      mergeReviewPosts(emptyReviewLedger(), [candidate('a')], { now: clock }),
      'a',
      'alpha',
      { now: clock },
    );

    const merged = mergeReviewPosts(
      decided,
      [candidate('a', { title: 'Renamed', permalink: 'https://x/a' })],
      { now: clock },
    );

    expect(merged.posts).toHaveLength(1);
    expect(merged.posts[0]).toMatchObject({
      id: 'a',
      status: 'approved',
      slug: 'alpha',
      decidedAt: NOW.toISOString(),
      firstSeenAt: NOW.toISOString(),
      title: 'Renamed',
      permalink: 'https://x/a',
    });
  });

  it('dedupes candidates with the same id', () => {
    const ledger = mergeReviewPosts(
      emptyReviewLedger(),
      [candidate('a'), candidate('a', { title: 'Second' })],
      { now: clock },
    );

    expect(ledger.posts).toHaveLength(1);
    expect(ledger.posts[0]?.title).toBe('Second');
  });
});

describe('mark helpers', () => {
  const base = mergeReviewPosts(emptyReviewLedger(), [candidate('a')], {
    now: clock,
  });

  it('marks a post approved with slug and decidedAt', () => {
    const ledger = markReviewApproved(base, 'a', 'alpha', { now: clock });

    expect(ledger.posts[0]).toMatchObject({
      status: 'approved',
      slug: 'alpha',
      decidedAt: NOW.toISOString(),
    });
    expect(ledger.posts[0]?.error).toBeUndefined();
  });

  it('marks a post rejected with decidedAt', () => {
    const ledger = markReviewRejected(base, 'a', { now: clock });

    expect(ledger.posts[0]).toMatchObject({
      status: 'rejected',
      decidedAt: NOW.toISOString(),
    });
  });

  it('keeps a failed post pending and records the error', () => {
    const ledger = markReviewFailed(base, 'a', 'boom');

    expect(ledger.posts[0]).toMatchObject({ status: 'pending', error: 'boom' });
  });

  it('clears a previous error on a successful approve', () => {
    const failed = markReviewFailed(base, 'a', 'boom');
    const approved = markReviewApproved(failed, 'a', 'alpha', { now: clock });

    expect(approved.posts[0]?.error).toBeUndefined();
  });
});

describe('pruneReviewLedger', () => {
  it('drops old decided entries and keeps pending ones', () => {
    const ledger: ReviewLedger = {
      posts: [
        {
          id: 'pending',
          title: 'Pending',
          permalink: 'https://x/p',
          createdUtc: 1,
          firstSeenAt: '2025-01-01T00:00:00.000Z',
          status: 'pending',
        },
        {
          id: 'old',
          title: 'Old',
          permalink: 'https://x/o',
          createdUtc: 2,
          firstSeenAt: '2024-01-01T00:00:00.000Z',
          status: 'approved',
          slug: 'old',
          decidedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'recent',
          title: 'Recent',
          permalink: 'https://x/r',
          createdUtc: 3,
          firstSeenAt: '2025-12-25T00:00:00.000Z',
          status: 'rejected',
          decidedAt: '2025-12-25T00:00:00.000Z',
        },
      ],
    };

    const pruned = pruneReviewLedger(ledger, { now: clock, retentionDays: 30 });

    expect(pruned.posts.map((post) => post.id)).toEqual(['pending', 'recent']);
  });

  it('disables pruning for a non-positive window', () => {
    const ledger = mergeReviewPosts(emptyReviewLedger(), [candidate('a')], {
      now: clock,
    });

    expect(pruneReviewLedger(ledger, { retentionDays: 0 })).toBe(ledger);
  });
});

describe('formatReviewMarkdown', () => {
  it('renders the pending/approved/rejected sections and the /approved line', () => {
    const ledger: ReviewLedger = {
      posts: [
        {
          id: 'abc',
          title: 'Alpha',
          permalink: 'https://reddit.com/abc',
          createdUtc: 1,
          firstSeenAt: NOW.toISOString(),
          status: 'pending',
        },
        {
          id: 'def',
          title: 'Beta',
          permalink: 'https://reddit.com/def',
          createdUtc: 2,
          firstSeenAt: NOW.toISOString(),
          status: 'approved',
          slug: 'beta',
          decidedAt: NOW.toISOString(),
        },
        {
          id: 'ghi',
          title: 'Gamma',
          permalink: 'https://reddit.com/ghi',
          createdUtc: 3,
          firstSeenAt: NOW.toISOString(),
          status: 'rejected',
          decidedAt: NOW.toISOString(),
        },
      ],
    };

    const markdown = formatReviewMarkdown(ledger);

    expect(markdown).toContain('# Reddit pipeline review');
    expect(markdown).toContain('## Pending (1)');
    expect(markdown).toContain('`abc` — Alpha — [source](https://reddit.com/abc)');
    expect(markdown).toContain('/approved abc');
    expect(markdown).toContain('## Approved (1)');
    expect(markdown).toContain('`def` → `beta` — Beta');
    expect(markdown).toContain('## Rejected (1)');
    expect(markdown).toContain('`ghi` — Gamma');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('omits the /approved hint when there is nothing pending', () => {
    const markdown = formatReviewMarkdown(emptyReviewLedger());

    expect(markdown).toContain('## Pending (0)');
    expect(markdown).not.toContain('/approved');
  });
});

describe('saveReviewLedger', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('writes the JSON ledger and the Markdown render', async () => {
    dir = await mkdtemp(join(tmpdir(), 'review-'));
    const path = join(dir, 'review.json');
    const markdownPath = join(dir, 'review.md');
    const ledger = mergeReviewPosts(emptyReviewLedger(), [candidate('a')], {
      now: clock,
    });

    const written = await saveReviewLedger(ledger, { path, markdownPath });

    expect(written).toBe(path);
    const json = await readFile(path, 'utf8');
    expect(json).toBe(`${JSON.stringify(ledger, null, 2)}\n`);
    const markdown = await readFile(markdownPath, 'utf8');
    expect(markdown).toBe(formatReviewMarkdown(ledger));
  });
});
