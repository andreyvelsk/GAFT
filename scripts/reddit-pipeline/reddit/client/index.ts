import { arcticShiftUrl, paginate, pullpushUrl } from './lib/helpers';
import type { FetchWindow } from './lib/types';
import type { RawPost } from '../../shared/lib/types';

export { fetchPostById, parsePostId } from './lib/helpers';

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

/** Fetch posts, falling back to pullpush when arctic-shift fails. */
export async function fetchPosts(window: FetchWindow): Promise<RawPost[]> {
  try {
    return await fetchArcticShift(window);
  } catch (error) {
    console.warn(`arctic-shift failed (${String(error)}), trying pullpush…`);
    return await fetchPullpush(window);
  }
}
