import { isRemovedSelftext } from '../../../shared/lib/helpers';
import type { RawPost, ReportEntry } from '../../../shared/lib/types';

/** Matches a YouTube video URL (watch, embed, shorts or youtu.be). */
const YOUTUBE_RE =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[^\s)\]]+/i;

/** Trailing markdown/punctuation characters to strip from an extracted URL. */
const TRAILING_MARKDOWN_RE = /[.,;:*_~`'"!?]+$/;

/** Decode the handful of HTML entities that appear in Reddit signed URLs. */
function htmlUnescape(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'");
}

/** Ordered signed image URLs from `media_metadata` / `gallery_data`. */
export function extractImages(post: RawPost): string[] {
  const urls: string[] = [];
  const meta = post.media_metadata ?? {};
  const ordered = (post.gallery_data?.items ?? []).map((item) => item.media_id);

  if (ordered.length > 0) {
    for (const mediaId of ordered) {
      const value = meta[mediaId];
      const url = value?.s?.u;
      if (value?.status === 'valid' && url !== undefined && url !== '') {
        urls.push(htmlUnescape(url));
      }
    }
  } else {
    for (const value of Object.values(meta)) {
      const url = value.s?.u;
      if (value.status === 'valid' && url !== undefined && url !== '') {
        urls.push(htmlUnescape(url));
      }
    }
  }

  if (urls.length === 0 && post.post_hint === 'image') {
    const url = post.url_overridden_by_dest ?? post.url ?? '';
    if (url.startsWith('https://i.redd.it')) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * First YouTube URL of a post (external URL or body), or `''`.
 * Only YouTube links are treated as videos.
 */
export function extractVideoUrl(post: RawPost): string {
  const candidates = [
    post.url_overridden_by_dest ?? '',
    post.url ?? '',
    post.selftext ?? '',
  ];
  for (const candidate of candidates) {
    const match = YOUTUBE_RE.exec(candidate);
    if (match !== null) {
      return match[0].replace(TRAILING_MARKDOWN_RE, '');
    }
  }
  return '';
}

/** Return the first non-empty string, or the last value when all are empty. */
function firstNonEmpty(
  ...values: readonly (string | null | undefined)[]
): string | null | undefined {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  return values[values.length - 1];
}

/**
 * Resolve the post whose content should be normalized. A crosspost carries an
 * empty body and a reddit-internal link; the real text, images and external
 * link live in `crosspost_parent_list[0]`. Fall back to the parent's content
 * when the post itself has none, keeping the post's own identity fields.
 */
function resolveContentPost(post: RawPost): RawPost {
  const parent = post.crosspost_parent_list?.[0];
  if (parent === undefined) {
    return post;
  }
  const hasMedia =
    post.media_metadata !== null &&
    post.media_metadata !== undefined &&
    Object.keys(post.media_metadata).length > 0;
  return {
    ...post,
    selftext: firstNonEmpty(post.selftext, parent.selftext),
    // The post's own `url` is the crosspost target (a reddit-internal link),
    // so the parent's destination is the meaningful one.
    url: firstNonEmpty(parent.url, post.url),
    url_overridden_by_dest: firstNonEmpty(
      parent.url_overridden_by_dest,
      post.url_overridden_by_dest,
    ),
    media_metadata: hasMedia ? post.media_metadata : parent.media_metadata,
    gallery_data: post.gallery_data ?? parent.gallery_data,
    post_hint: post.post_hint ?? parent.post_hint,
  };
}

/** Normalize a raw post into a report entry. */
export function postToReport(post: RawPost): ReportEntry {
  const content = resolveContentPost(post);
  const permalink = post.permalink ?? `/r/AynThor/comments/${post.id}/`;
  const fullUrl = permalink.startsWith('http')
    ? permalink
    : `https://www.reddit.com${permalink}`;

  let external = content.url_overridden_by_dest ?? content.url ?? '';
  if (external.startsWith('/r/') || external.includes('reddit.com')) {
    external = '';
  }

  const rawSelftext = (content.selftext ?? '').trim();
  if (isRemovedSelftext(rawSelftext)) {
    console.warn(
      `post ${post.id} body is "${rawSelftext}" (removed by Reddit); treating it as empty`,
    );
  }

  return {
    id: post.id.toLowerCase(),
    title: post.title,
    author: post.author,
    created_utc: Math.trunc(post.created_utc),
    permalink: fullUrl,
    selftext: isRemovedSelftext(rawSelftext) ? '' : rawSelftext,
    external_url: external,
    flair: post.link_flair_text ?? '',
    images: extractImages(content),
    video_url: extractVideoUrl(content),
  };
}
