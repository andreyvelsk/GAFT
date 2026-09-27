import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ARCTIC_SHIFT_API,
  ARCTIC_SHIFT_IDS_API,
  PULLPUSH_API,
  REDDIT_RSS_POST_API,
  REDDIT_RSS_SUB_API,
} from '../../../shared/lib/constants';
import {
  fetchArcticShift,
  fetchPostById,
  fetchPosts,
  fetchPullpush,
  parsePostId,
} from '../index';

/** Minimal raw post payload accepted by `rawPostSchema`. */
function postJson(id: string, createdUtc: number): Record<string, unknown> {
  return {
    id,
    title: `Post ${id}`,
    author: 'author',
    created_utc: createdUtc,
    permalink: `/r/AynThor/comments/${id}/`,
    selftext: '',
    url: `https://www.reddit.com/r/AynThor/comments/${id}/`,
  };
}

/** Build a JSON `Response` for the mocked `fetch`. */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

/** Minimal Reddit Atom feed with a single entry. */
const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><entry><author><name>/u/author</name></author><content type="html"><div class="md"><p>body</p></div></content><id>t3_rsspost</id><link href="https://www.reddit.com/r/AynThor/comments/rsspost/slug/" /><published>2026-08-25T19:37:30+00:00</published><title>RSS post</title></entry></feed>`;

/** Build a text `Response` for the mocked `fetch`. */
function textResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

/** Run an async operation while fake timers drive the retry/polite delays. */
async function withFakeTimers<T>(run: () => Promise<T>): Promise<T> {
  vi.useFakeTimers();
  try {
    const promise = run();
    await vi.runAllTimersAsync();
    return await promise;
  } finally {
    vi.useRealTimers();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('reddit client', () => {
  it('fetches posts from arctic-shift', async () => {
    const fetchMock = vi.fn((_input: string) =>
      Promise.resolve(
        jsonResponse({ data: [postJson('a', 10), postJson('b', 20)] }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const posts = await fetchArcticShift({
      subreddit: 'AynThor',
      after: 0,
      before: 100,
    });

    expect(posts.map((post) => post.id)).toEqual(['a', 'b']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0]?.[0] ?? '';
    expect(calledUrl.startsWith(ARCTIC_SHIFT_API)).toBe(true);
  });

  it('fetches posts from pullpush', async () => {
    const fetchMock = vi.fn((_input: string) =>
      Promise.resolve(jsonResponse({ data: [postJson('p', 1)] })),
    );
    vi.stubGlobal('fetch', fetchMock);

    const posts = await fetchPullpush({
      subreddit: 'AynThor',
      after: 0,
      before: 100,
    });

    expect(posts.map((post) => post.id)).toEqual(['p']);
    const calledUrl = fetchMock.mock.calls[0]?.[0] ?? '';
    expect(calledUrl.startsWith(PULLPUSH_API)).toBe(true);
  });

  it('paginates forward by created_utc', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      postJson(`p${index}`, index + 1),
    );
    const fetchMock = vi.fn((input: string) => {
      if (input.includes('after=100')) {
        return Promise.resolve(jsonResponse({ data: [postJson('last', 200)] }));
      }
      return Promise.resolve(jsonResponse({ data: firstPage }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const posts = await withFakeTimers(() =>
      fetchArcticShift({ subreddit: 'AynThor', after: 0, before: 1000 }),
    );

    expect(posts).toHaveLength(101);
    expect(posts.at(-1)?.id).toBe('last');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to pullpush when arctic-shift fails', async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.startsWith(ARCTIC_SHIFT_API)) {
        return Promise.resolve(new Response('', { status: 500 }));
      }
      return Promise.resolve(jsonResponse({ data: [postJson('fallback', 5)] }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const posts = await withFakeTimers(() =>
      fetchPosts({ subreddit: 'AynThor', after: 0, before: 100 }),
    );

    expect(posts.map((post) => post.id)).toEqual(['fallback']);
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls.some((url) => url.startsWith(PULLPUSH_API))).toBe(true);
  });

  it('falls back to the RSS feed when arctic-shift and pullpush fail', async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.startsWith(REDDIT_RSS_SUB_API)) {
        return Promise.resolve(textResponse(SAMPLE_FEED));
      }
      return Promise.resolve(new Response('', { status: 500 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const posts = await withFakeTimers(() =>
      fetchPosts({ subreddit: 'AynThor', after: 0, before: 2_000_000_000 }),
    );

    expect(posts.map((post) => post.id)).toEqual(['rsspost']);
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls.some((url) => url.startsWith(REDDIT_RSS_SUB_API))).toBe(true);
  });
});

describe('parsePostId', () => {
  it('extracts the id from a permalink', () => {
    expect(
      parsePostId('https://www.reddit.com/r/AynThor/comments/1wptab9/slug/'),
    ).toBe('1wptab9');
  });

  it('returns null when the url has no post id', () => {
    expect(parsePostId('https://www.reddit.com/r/AynThor/')).toBeNull();
  });
});

describe('fetchPostById', () => {
  it('fetches a single post by id from arctic-shift', async () => {
    const fetchMock = vi.fn((_input: string) =>
      Promise.resolve(jsonResponse({ data: [postJson('1wptab9', 10)] })),
    );
    vi.stubGlobal('fetch', fetchMock);

    const post = await fetchPostById('1wptab9');

    expect(post?.id).toBe('1wptab9');
    const calledUrl = fetchMock.mock.calls[0]?.[0] ?? '';
    expect(calledUrl.startsWith(ARCTIC_SHIFT_IDS_API)).toBe(true);
    expect(calledUrl).toContain('ids=1wptab9');
  });

  it('returns null when the post is missing', async () => {
    const fetchMock = vi.fn((_input: string) =>
      Promise.resolve(jsonResponse({ data: [] })),
    );
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchPostById('missing')).toBeNull();
  });

  it('falls back to pullpush when arctic-shift fails', async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.startsWith(ARCTIC_SHIFT_IDS_API)) {
        return Promise.resolve(new Response('', { status: 500 }));
      }
      return Promise.resolve(jsonResponse({ data: [postJson('fallback', 5)] }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const post = await withFakeTimers(() => fetchPostById('1wptab9'));

    expect(post?.id).toBe('fallback');
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls.some((url) => url.startsWith(PULLPUSH_API))).toBe(true);
  });

  it('falls back to pullpush when arctic-shift has no such post', async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.startsWith(ARCTIC_SHIFT_IDS_API)) {
        return Promise.resolve(jsonResponse({ data: [] }));
      }
      return Promise.resolve(jsonResponse({ data: [postJson('from-pullpush', 5)] }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const post = await fetchPostById('1wptab9');

    expect(post?.id).toBe('from-pullpush');
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls.some((url) => url.startsWith(PULLPUSH_API))).toBe(true);
  });

  it('falls back to the RSS feed when arctic-shift and pullpush fail', async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.startsWith(REDDIT_RSS_POST_API)) {
        return Promise.resolve(textResponse(SAMPLE_FEED));
      }
      return Promise.resolve(new Response('', { status: 500 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const post = await withFakeTimers(() => fetchPostById('rsspost'));

    expect(post?.id).toBe('rsspost');
    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls.some((url) => url.startsWith(REDDIT_RSS_POST_API))).toBe(true);
  });
});

const runIntegration = process.env.RUN_REDDIT_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('reddit client integration', () => {
  it(
    'fetches the last 24h of r/AynThor posts',
    async () => {
      const before = Math.floor(Date.now() / 1000);
      const after = before - 24 * 60 * 60;
      const posts = await fetchPosts({ subreddit: 'AynThor', after, before });
      console.warn(
        `Fetched ${posts.length} posts from r/AynThor in the last 24h`,
      );
      expect(Array.isArray(posts)).toBe(true);
    },
    60000,
  );
});
