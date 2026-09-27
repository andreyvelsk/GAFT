import {
  arcticShiftUrl,
  fetchPostsRss,
  paginate,
  pullpushUrl,
} from './lib/helpers';
import type { FetchWindow } from './lib/types';
import type { RawPost } from '../../shared/lib/types';

export {
  fetchPostById,
  fetchPostByIdRss,
  fetchPostsRss,
  parsePostId,
} from './lib/helpers';

/** Fetch posts from arctic-shift (primary source). */
export async function fetchArcticShift(
  window: FetchWindow,
): Promise<RawPost[]> {
  return await paginate(window, (cursor) => arcticShiftUrl(window, cursor));
}

/** Fetch posts from pullpush (fallback source). */
export async function fetchPullpush(window: FetchWindow): Promise<RawPost[]> {
  return await paginate(window, (cursor) => pullpushUrl(window, cursor));
}

/**
 * Fetch posts, falling back to pullpush and then to the Reddit Atom feed when
 * the earlier sources fail.
 */
export async function fetchPosts(window: FetchWindow): Promise<RawPost[]> {
  try {
    return await fetchArcticShift(window);
  } catch (error) {
    console.warn(`arctic-shift failed (${String(error)}), trying pullpush…`);
  }
  try {
    return await fetchPullpush(window);
  } catch (error) {
    console.warn(`pullpush failed (${String(error)}), trying RSS…`);
  }
  return await fetchPostsRss(window);
}
