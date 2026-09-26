import { z } from 'zod';

import { MEDIA_LIMITS } from '../../../shared/lib/constants';

/** A single media entry of a page. */
export const mediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().min(1),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

/** A single `## <heading>` section of a page body. */
export const pageSectionSchema = z.object({
  /** Section heading without the leading `## `. */
  heading: z.string().min(1),

  /** Section body in Markdown (may be empty). */
  body: z.string(),
});

export type PageSection = z.infer<typeof pageSectionSchema>;

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

    if (images > MEDIA_LIMITS.maxImagesHard) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['media'],
        message: `too many images: ${images} (max ${MEDIA_LIMITS.maxImagesHard})`,
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
  /** Permalink of the source Reddit post (empty string omits the line). */
  sourceUrl: string;

  /** Ordered `## <heading>` sections of the page body. */
  sections: PageSection[];

  /** Canonical project URL (empty string omits the trailing link). */
  projectUrl: string;
}

/** Input accepted by {@link renderPage}. */
export interface PageInput {
  frontmatter: PageFrontmatter;

  sections: PageSections;

  /**
   * Extra frontmatter keys preserved from an existing page (e.g. `tags`).
   * They are written after the well-known keys.
   */
  extraFrontmatter?: Record<string, unknown>;
}
