import { describe, expect, it } from 'vitest';

import {
  decodeEntities,
  extractExternalUrl,
  extractSelftext,
  parseAtomFeed,
} from '../lib/rss';

// Entity strings are assembled at runtime so the source file itself stays free
// of HTML entities (which would otherwise be decoded when the file is written).
/** Build an HTML entity from its name, e.g. `entity('amp;')` → `&`. */
function entity(name: string): string {
  return ['&', name].join('');
}

const AMP = entity('amp;');
const LT = entity('lt;');
const GT = entity('gt;');
const QUOT = entity('quot;');
const DOUBLE_AMP = entity('amp;amp;');

/** Escape a raw HTML fragment the way Reddit escapes its Atom `content`. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT)
    .replace(/"/g, QUOT);
}

/** Raw HTML body of the sample post (URLs already carry `&`). */
const CONTENT_HTML = `<table><tr><td><a href="https://www.reddit.com/r/AynThor/comments/1vya2n0/slug/"><img src="https://preview.redd.it/abc.png?width=640${AMP}crop=smart${AMP}s=xyz" /></a></td><td><div class="md"><p>Hello & welcome</p><p>See <a href="https://github.com/foo/bar">repo</a></p></div></td></tr></table>`;

/** A trimmed-down Reddit Atom feed with a single entry. */
const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><entry><author><name>/u/ProfMags</name></author><content type="html">${escapeHtml(CONTENT_HTML)}</content><id>t3_1vya2n0</id><media:thumbnail url="https://preview.redd.it/abc.png?width=640${AMP}crop=smart${AMP}s=xyz" /><link href="https://www.reddit.com/r/AynThor/comments/1vya2n0/slug/" /><published>2026-08-25T19:37:30+00:00</published><title>Mario Kart 8 & Zelda</title></entry></feed>`;

describe('decodeEntities', () => {
  it('decodes markup and collapses double-encoded ampersands', () => {
    const input = `${LT}p${GT}A ${DOUBLE_AMP} B${LT}/p${GT}`;
    expect(decodeEntities(input)).toBe(`<p>A ${AMP} B</p>`);
  });
});

describe('extractSelftext', () => {
  it('returns the plain text of the markdown body', () => {
    const html = `<div class="md"><p>Hello & welcome</p><p>See <a href="https://github.com/foo/bar">repo</a></p></div>`;
    expect(extractSelftext(html)).toBe('Hello & welcome\nSee repo');
  });

  it('returns an empty string when there is no body', () => {
    expect(extractSelftext('<table></table>')).toBe('');
  });
});

describe('extractExternalUrl', () => {
  it('skips reddit links and returns the first external one', () => {
    const html = `<a href="https://www.reddit.com/r/AynThor/comments/1vya2n0/">x</a><a href="https://github.com/foo/bar">y</a>`;
    expect(extractExternalUrl(html)).toBe('https://github.com/foo/bar');
  });

  it('returns an empty string when only reddit links exist', () => {
    expect(
      extractExternalUrl('<a href="https://www.reddit.com/r/AynThor/">x</a>'),
    ).toBe('');
  });
});

describe('parseAtomFeed', () => {
  it('maps an Atom entry to a raw post', () => {
    const posts = parseAtomFeed(SAMPLE_FEED);

    expect(posts).toHaveLength(1);
    const post = posts[0];
    expect(post?.id).toBe('1vya2n0');
    expect(post?.title).toBe('Mario Kart 8 & Zelda');
    expect(post?.author).toBe('ProfMags');
    expect(post?.created_utc).toBe(
      Math.floor(Date.parse('2026-08-25T19:37:30+00:00') / 1000),
    );
    expect(post?.permalink).toBe(
      'https://www.reddit.com/r/AynThor/comments/1vya2n0/slug/',
    );
    expect(post?.selftext).toBe('Hello & welcome\nSee repo');
    expect(post?.url).toBe('https://github.com/foo/bar');
    expect(post?.media_metadata?.rss0?.s?.u).toBe(
      'https://preview.redd.it/abc.png?width=640&crop=smart&s=xyz',
    );
  });

  it('returns an empty array for a feed without entries', () => {
    expect(parseAtomFeed('<feed></feed>')).toEqual([]);
  });
});
