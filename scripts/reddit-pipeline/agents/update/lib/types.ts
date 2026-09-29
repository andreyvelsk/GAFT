import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { MediaPlanItem } from '../../../content/media';
import {
  pageSectionsSchema,
  projectCategorySchema,
  type PageInput,
} from '../../../content/template';
import type {
  GitHubRepo,
  ReleaseInfo,
  RepoOptions,
} from '../../../github/repo';
import type { Logger } from '../../../shared/lib/types';
import type {
  GenerateObjectLike,
  ProviderOptions,
} from '../../../engines/generation/lib/types';

/**
 * Patch produced by the update agent. Only the fields that actually change are
 * present; `reason` is always required.
 */
export const updatePatchSchema = z.object({
  /** New page title, when it changes. */
  title: z.string().min(1).optional(),

  /** New frontmatter description, when it changes. */
  description: z.string().min(1).optional(),

  /** New category from the controlled vocabulary, when it changes. */
  category: projectCategorySchema.optional(),

  /** New canonical project link, when it changes. */
  project_url: z.string().optional(),

  /**
   * Full ordered list of `## <heading>` sections, when the page structure or
   * any section changes. When present it replaces the whole section list and
   * must contain `Description` and `Setup guide` (at most
   * {@link MAX_PAGE_SECTIONS} sections).
   */
  sections: pageSectionsSchema.optional(),

  /** New image URLs chosen from the post, when the media changes. */
  media: z.array(z.string()).optional(),

  /** Short English explanation of the update. */
  reason: z.string().min(1),
});

export type UpdatePatch = z.infer<typeof updatePatchSchema>;

/** Research context gathered deterministically before the LLM call. */
export interface UpdateContext {
  /** Repository resolved from the post (or `null`). */
  repo: GitHubRepo | null;

  /** Raw README of the repository (or `null`). */
  readme: string | null;

  /** Latest release of the repository (or `null`). */
  release: ReleaseInfo | null;

  /**
   * Every repository linked from the post, in link order. Omitted when nothing
   * was resolved.
   */
  candidates?: GitHubRepo[];
}

/** Result of applying a patch to an existing page. */
export interface AppliedPatch {
  /** Updated page input ready for `renderPage`. */
  page: PageInput;

  /** Media files to download for the page. */
  media: MediaPlanItem[];

  /** Names of the fields that actually changed. */
  changed: string[];
}

/** Result of the update agent. */
export interface UpdateResult {
  /** Page slug. */
  slug: string;

  /** Raw patch returned by the model. */
  patch: UpdatePatch;

  /** Research context used to build the patch. */
  context: UpdateContext;

  /** Updated page input ready for `renderPage`. */
  page: PageInput;

  /** Rendered `index.md` document. */
  markdown: string;

  /** Media files to download for the page. */
  media: MediaPlanItem[];

  /** Names of the fields that actually changed. */
  changed: string[];
}

/** Options accepted by the update agent. */
export interface UpdateOptions {
  /** Structured logger for progress output (defaults to a stdout logger). */
  logger?: Logger;

  /** Pre-built language model (used by tests / callers). */
  model?: LanguageModel;

  /** OpenRouter provider settings override. */
  provider?: ProviderOptions;

  /** Injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** Number of repair attempts on invalid output (defaults to `1`). */
  maxRepairAttempts?: number;

  /** GitHub request options (token, fetch, retries). */
  repoOptions?: RepoOptions;

  /** Pre-gathered research context; when provided the network is not used. */
  context?: UpdateContext;

  /** Timestamp used when the page has no date (defaults to now). */
  now?: Date;
}
