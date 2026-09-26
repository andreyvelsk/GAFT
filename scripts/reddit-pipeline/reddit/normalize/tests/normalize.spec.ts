import { describe, expect, it } from 'vitest';

import { rawPostSchema, type RawPost } from '../../../shared/lib/types';
import { extractImages, extractVideoUrl, postToReport } from '../index';

/** Build a valid `RawPost` from a base payload plus overrides. */
function makePost(overrides: Record<string, unknown> = {}): RawPost {
  return rawPostSchema.parse({
    id: 'AbC123',
    title: 'My dual screen app',
    author: 'someone',
    created_utc: 1700000000,
    permalink: '/r/AynThor/comments/AbC123/my_app/',
    selftext: 'text',
    url: 'https://www.reddit.com/r/AynThor/comments/AbC123/my_app/',
    link_flair_text: 'Project',
    ...overrides,
  });
}

describe('postToReport', () => {
  it('normalizes id, permalink and drops internal reddit links', () => {
    const entry = postToReport(makePost());

    expect(entry.id).toBe('abc123');
    expect(entry.permalink).toBe(
      'https://www.reddit.com/r/AynThor/comments/AbC123/my_app/',
    );
    expect(entry.external_url).toBe('');
  });

  it('keeps a real external destination', () => {
    const entry = postToReport(
      makePost({ url_overridden_by_dest: 'https://github.com/user/repo' }),
    );

    expect(entry.external_url).toBe('https://github.com/user/repo');
  });

  it('drops a reddit.com external destination', () => {
    const entry = postToReport(
      makePost({ url_overridden_by_dest: 'https://www.reddit.com/r/other' }),
    );

    expect(entry.external_url).toBe('');
  });

  it('trims selftext and defaults missing flair', () => {
    const entry = postToReport(
      makePost({ selftext: '  hello  ', link_flair_text: null }),
    );

    expect(entry.selftext).toBe('hello');
    expect(entry.flair).toBe('');
  });
});

describe('extractImages', () => {
  it('extracts valid images from media_metadata and unescapes entities', () => {
    const entry = postToReport(
      makePost({
        media_metadata: {
          a: {
            status: 'valid',
            s: { u: 'https://preview.redd.it/a.jpg?width=1&s=abc' },
          },
          b: { status: 'invalid', s: { u: 'https://preview.redd.it/b.jpg' } },
        },
      }),
    );

    expect(entry.images).toEqual([
      'https://preview.redd.it/a.jpg?width=1&s=abc',
    ]);
  });

  it('orders gallery images by gallery_data', () => {
    const entry = postToReport(
      makePost({
        media_metadata: {
          a: { status: 'valid', s: { u: 'https://preview.redd.it/a.jpg' } },
          b: { status: 'valid', s: { u: 'https://preview.redd.it/b.jpg' } },
        },
        gallery_data: { items: [{ media_id: 'b' }, { media_id: 'a' }] },
      }),
    );

    expect(entry.images).toEqual([
      'https://preview.redd.it/b.jpg',
      'https://preview.redd.it/a.jpg',
    ]);
  });

  it('falls back to i.redd.it for image posts', () => {
    const entry = postToReport(
      makePost({
        post_hint: 'image',
        url_overridden_by_dest: 'https://i.redd.it/xyz.jpg',
      }),
    );

    expect(entry.images).toEqual(['https://i.redd.it/xyz.jpg']);
  });

  it('returns no images when nothing is available', () => {
    expect(extractImages(makePost())).toEqual([]);
  });
});

describe('extractVideoUrl', () => {
  it('extracts a YouTube watch URL from the external link', () => {
    const entry = postToReport(
      makePost({
        url_overridden_by_dest: 'https://www.youtube.com/watch?v=abc123',
      }),
    );

    expect(entry.video_url).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('extracts a youtu.be URL from the body', () => {
    const entry = postToReport(
      makePost({ selftext: 'Video: https://youtu.be/abc123' }),
    );

    expect(entry.video_url).toBe('https://youtu.be/abc123');
  });

  it('ignores non-YouTube links', () => {
    expect(
      extractVideoUrl(
        makePost({ url_overridden_by_dest: 'https://example.com/video.mp4' }),
      ),
    ).toBe('');
  });

  it('returns an empty string when there is no video', () => {
    expect(postToReport(makePost()).video_url).toBe('');
  });
});
