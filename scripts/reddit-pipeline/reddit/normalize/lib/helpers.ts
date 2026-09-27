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

/** Normalize a raw post into a report entry. */
export function postToReport(post: RawPost): ReportEntry {
  const permalink = post.permalink ?? `/r/AynThor/comments/${post.id}/`;
  const fullUrl = permalink.startsWith('http')
    ? permalink
    : `https://www.reddit.com${permalink}`;

  let external = post.url_overridden_by_dest ?? post.url ?? '';
  if (external.startsWith('/r/') || external.includes('reddit.com')) {
    external = '';
  }

  return {
    id: post.id.toLowerCase(),
    title: post.title,
    author: post.author,
    created_utc: Math.trunc(post.created_utc),
    permalink: fullUrl,
    selftext: (post.selftext ?? '').trim(),
    external_url: external,
    flair: post.link_flair_text ?? '',
    images: extractImages(post),
    video_url: extractVideoUrl(post),
  };
}
