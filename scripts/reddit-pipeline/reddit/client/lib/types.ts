import { z } from 'zod';

import { rawPostSchema } from '../../../shared/lib/types';

/** Time window (Unix seconds) and subreddit to fetch posts for. */
export interface FetchWindow {
  subreddit: string;
  after: number;
  before: number;
}

/** Envelope returned by both Reddit mirrors (`{ data: RawPost[] }`). */
export const redditResponseSchema = z.object({
  data: z.array(rawPostSchema).default([]),
});

export type RedditResponse = z.infer<typeof redditResponseSchema>;
