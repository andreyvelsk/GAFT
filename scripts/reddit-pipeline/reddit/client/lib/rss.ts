import type { RawPost } from '../../../shared/lib/types';

/** Matches a single Atom `<entry>` block. */
const ENTRY_RE = /<entry>([\s\S]*?)<\/entry>/g;

// Entity strings are assembled at runtime so the source file itself stays free
// of HTML entities (which would otherwise be decoded when the file is written).
/** Build an HTML entity from its name. */
function entity(name: string): string {
  return ['&', name].join('');
}

const AMP = entity('amp;');
const LT = entity('lt;');
const GT = entity('gt;');
const QUOT = entity('quot;');

/**
 * Decode the HTML/XML entities that appear in Reddit Atom feeds.
 * The ampersand entity is decoded last so that double-encoded URLs collapse
 * to a single ampersand only after the surrounding markup has been decoded.
 */
export function decodeEntities(input: string): string {
  return input
    .replace(new RegExp(LT, 'g'), '<')
    .replace(new RegExp(GT, 'g'), '>')
    .replace(new RegExp(QUOT, 'g'), '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(new RegExp(AMP, 'g'), '&');
}

/** Return the first capture group of `re` in `source`, or `''`. */
function firstMatch(source: string, re: RegExp): string {
  return re.exec(source)?.[1] ?? '';
}

/** Strip HTML tags from a fragment, keeping paragraph/line breaks. */
function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Plain-text body of a Reddit Atom `content` blob. */
export function extractSelftext(contentHtml: string): string {
  const md = /<div class="md">([\s\S]*)<\/div>/.exec(contentHtml)?.[1] ?? '';
  return stripTags(md);
}

/** Image URLs referenced by a Reddit Atom `content` blob. */
export function extractContentImages(contentHtml: string): string[] {
  const urls: string[] = [];
  for (const match of contentHtml.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const url = match[1];
    if (url !== undefined && url !== '' && !urls.includes(url)) {
      urls.push(url);
    }
  }
  return urls;
}

/** First external (non-Reddit) link in a Reddit Atom `content` blob. */
export function extractExternalUrl(contentHtml: string): string {
  for (const match of contentHtml.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    const url = match[1];
    if (
      url !== undefined &&
      url !== '' &&
      !url.includes('reddit.com') &&
      !url.startsWith('/')
    ) {
      return url;
    }
  }
  return '';
}

/** Build `media_metadata` so the normalizer can pick up RSS images. */
function toMediaMetadata(
  urls: readonly string[],
): Record<string, { status: string; s: { u: string } }> {
  const result: Record<string, { status: string; s: { u: string } }> = {};
  urls.forEach((url, index) => {
    result[`rss${index}`] = { status: 'valid', s: { u: url } };
  });
  return result;
}

/**
 * Parse a Reddit Atom feed into raw posts.
 *
 * The feed exposes the post id (`t3_…`), title, author, permalink, publish
 * date, body (as escaped HTML) and a thumbnail. Gallery/`media_metadata`
 * information is not available, so only the thumbnail and inline images are
 * recovered.
 */
export function parseAtomFeed(xml: string): RawPost[] {
  const posts: RawPost[] = [];
  for (const match of xml.matchAll(ENTRY_RE)) {
    const entry = match[1] ?? '';
    const id = firstMatch(entry, /<id>([^<]*)<\/id>/).replace(/^t3_/, '');
    if (id === '') {
      continue;
    }

    // The `content` blob is XML-escaped once and its URLs are escaped again,
    // so decode twice to recover the real HTML.
    const contentHtml = decodeEntities(
      decodeEntities(firstMatch(entry, /<content type="html">([\s\S]*?)<\/content>/)),
    );
    const thumbnail = decodeEntities(
      firstMatch(entry, /<media:thumbnail url="([^"]*)"/),
    );
    const images = extractContentImages(contentHtml);
    if (images.length === 0 && thumbnail !== '') {
      images.push(thumbnail);
    }

    const externalUrl = extractExternalUrl(contentHtml);
    const published = firstMatch(entry, /<published>([^<]*)<\/published>/);
    const createdUtc = Math.floor(Date.parse(published) / 1000);

    posts.push({
      id,
      title: decodeEntities(firstMatch(entry, /<title>([\s\S]*?)<\/title>/)),
      author: firstMatch(entry, /<author>[\s\S]*?<name>([^<]*)<\/name>/).replace(
        /^\/u\//,
        '',
      ),
      created_utc: Number.isFinite(createdUtc) ? createdUtc : 0,
      permalink: firstMatch(entry, /<link href="([^"]*)"/),
      selftext: extractSelftext(contentHtml),
      url: externalUrl,
      url_overridden_by_dest: externalUrl,
      media_metadata: images.length > 0 ? toMediaMetadata(images) : undefined,
    });
  }
  return posts;
}
