import { z } from 'zod';

import {
  CATEGORY_DEFINITIONS,
  PAGE_CATEGORIES,
  PROJECT_CATEGORIES,
} from '../../../../../lib/categories';
import { MEDIA_LIMITS } from '../../../shared/lib/constants';

export {
  CATEGORY_DEFINITIONS,
  CATEGORY_LABELS,
  PAGE_CATEGORIES,
  PROJECT_CATEGORIES,
  SYSTEM_CATEGORIES,
  isPageCategory,
  isProjectCategory,
  isSystemCategory,
  type PageCategory,
  type ProjectCategory,
  type SystemCategory,
} from '../../../../../lib/categories';

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
 * Validated project category (one of {@link PROJECT_CATEGORIES}). Used by the
 * create/update agents, which may only produce project pages.
 */
export const projectCategorySchema = z.enum(PROJECT_CATEGORIES);

/**
 * Validated page category (one of {@link PAGE_CATEGORIES}). Used to validate
 * the frontmatter of any content page, including system pages.
 */
export const pageCategorySchema = z.enum(PAGE_CATEGORIES);

/**
 * Prompt fragment listing the project categories with their definitions.
 * Derived from the single source of truth so the agents always describe the
 * categories exactly as the docs and the UI do.
 */
export const CATEGORY_PROMPT_GUIDE = PROJECT_CATEGORIES.map(
  (category) => `  - "${category}": ${CATEGORY_DEFINITIONS[category]}`,
).join('\n');

/** Hard limit on the number of `## <heading>` sections of a page. */
export const MAX_PAGE_SECTIONS = 4;

/** Section headings every generated page must contain. */
export const REQUIRED_SECTION_HEADINGS = ['Description', 'Setup guide'] as const;

/** Required headings missing from a section list (case-insensitive). */
export function missingRequiredSections(
  sections: readonly PageSection[],
): string[] {
  const headings = new Set(
    sections.map((section) => section.heading.trim().toLowerCase()),
  );
  return REQUIRED_SECTION_HEADINGS.filter(
    (heading) => !headings.has(heading.toLowerCase()),
  );
}

/**
 * Ordered section list with the hard limit and the required headings enforced.
 * Used by the create/update agent schemas so a model can never produce a page
 * without `Description`/`Setup guide` or with too many sections.
 */
export const pageSectionsSchema = z
  .array(pageSectionSchema)
  .min(1)
  .max(MAX_PAGE_SECTIONS)
  .superRefine((sections, ctx) => {
    for (const heading of missingRequiredSections(sections)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: `missing required section: ${heading}`,
      });
    }
  });

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
    category: pageCategorySchema,
    media: z
      .array(mediaItemSchema)
      .nullish()
      .transform((value) => value ?? []),
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
