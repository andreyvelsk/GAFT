import { z } from 'zod';

/** A single entry of `media_metadata` (signed image URL lives in `s.u`). */
export const mediaMetadataSchema = z
  .object({
    status: z.string().optional(),
    s: z.object({ u: z.string().optional() }).optional(),
  })
  .passthrough();

export type MediaMetadata = z.infer<typeof mediaMetadataSchema>;

/** `gallery_data` of a gallery post (ordered list of media ids). */
export const galleryDataSchema = z
  .object({
    items: z.array(z.object({ media_id: z.string() })).optional(),
  })
  .passthrough();

export type GalleryData = z.infer<typeof galleryDataSchema>;

/**
 * Raw post as returned by the Reddit mirrors. Only the fields the pipeline
 * relies on are declared; unknown fields are preserved via `passthrough`.
 */
export const rawPostSchema = z
  .object({
    id: z.string(),
    title: z.string().default(''),
    author: z.string().default(''),
    created_utc: z.coerce.number(),
    permalink: z.string().nullish(),
    selftext: z.string().nullish(),
    url: z.string().nullish(),
    url_overridden_by_dest: z.string().nullish(),
    link_flair_text: z.string().nullish(),
    media_metadata: z.record(mediaMetadataSchema).nullish(),
    gallery_data: galleryDataSchema.nullish(),
    post_hint: z.string().nullish(),
  })
  .passthrough();

export type RawPost = z.infer<typeof rawPostSchema>;

/** Normalized post entry passed between the pipeline stages. */
export const reportEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  created_utc: z.number(),
  permalink: z.string(),
  selftext: z.string(),
  external_url: z.string(),
  flair: z.string(),
  images: z.array(z.string()),

  /** YouTube URL of the post, when it links to a video (empty otherwise). */
  video_url: z.string().optional(),
});

export type ReportEntry = z.infer<typeof reportEntrySchema>;
