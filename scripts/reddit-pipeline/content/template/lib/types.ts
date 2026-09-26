import { z } from 'zod';

import { MEDIA_LIMITS } from '../../../shared/lib/constants';

/** A single media entry of a page. */
export const mediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().min(1),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

/**
 * Validated frontmatter of a project page. Enforces the required fields and
 * the media limits (≤3 images, ≤1 video) before a page is written.
 */
export const pageFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().min(1),
    slug: z.string().min(1),
    category: z.string().min(1),
    media: z.array(mediaItemSchema).default([]),
  })
  .superRefine((value, ctx) => {
    const images = value.media.filter((item) => item.type === 'image').length;
    const videos = value.media.filter((item) => item.type === 'video').length;

    if (images > MEDIA_LIMITS.maxImages) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['media'],
        message: `too many images: ${images} (max ${MEDIA_LIMITS.maxImages})`,
      });
    }
    if (videos > MEDIA_LIMITS.maxVideos) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['media'],
        message: `too many videos: ${videos} (max ${MEDIA_LIMITS.maxVideos})`,
      });
    }
  });

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

/** Standard markdown sections of a generated project page. */
export interface PageSections {
  /** Permalink of the source Reddit post. */
  sourceUrl: string;

  /** Description section body. */
  description: string;

  /** Setup guide section body. */
  setupGuide: string;

  /** Canonical project URL (repository or store page). */
  projectUrl: string;
}

/** Input accepted by {@link renderPage}. */
export interface PageInput {
  frontmatter: PageFrontmatter;
  sections: PageSections;
}
