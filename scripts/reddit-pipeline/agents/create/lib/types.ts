import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { MediaPlanItem } from '../../../content/media';
import { pageSectionSchema, type PageInput } from '../../../content/template';
import type {
  GitHubRepo,
  ReleaseInfo,
  RepoOptions,
} from '../../../github/repo';
import type { ReportEntry } from '../../../shared/lib/types';
import type {
  GenerateObjectLike,
  ProviderOptions,
} from '../../provider/lib/types';

/**
 * Draft page produced by the create agent (LLM output).
 *
 * The agent only supplies the human-authored content; the deterministic code
 * fills in the date, the media file paths, the source link and the project URL.
 */
export const createDraftSchema = z.object({
  /** Project name used as the page title. */
  title: z.string().min(1),

  /** One or two sentences for the page frontmatter. */
  description: z.string().min(1),

  /** Single lowercase category word (e.g. `game`, `app`, `port`). */
  category: z.string().min(1),

  /** Kebab-case slug derived from the project name. */
  slug: z.string().min(1),

  /**
   * Ordered `## <heading>` sections of the page body. Standard headings are
   * `Description` and `Setup guide`; extra sections are allowed.
   */
  sections: z.array(pageSectionSchema).min(1),

  /** Image URLs chosen from the post images (may be empty). */
  media: z.array(z.string()).default([]),
});

export type CreateDraft = z.infer<typeof createDraftSchema>;

/** Research context gathered deterministically before the LLM call. */
export interface CreateContext {
  /** Repository resolved from the post (or `null`). */
  repo: GitHubRepo | null;

  /** Raw README of the repository (or `null`). */
  readme: string | null;

  /** Latest release of the repository (or `null`). */
  release: ReleaseInfo | null;
}

export type { MediaPlanItem };

/** Result of the create agent. */
export interface CreateResult {
  /** Resolved page slug. */
  slug: string;

  /** Raw draft returned by the model. */
  draft: CreateDraft;

  /** Research context used to build the page. */
  context: CreateContext;

  /** Validated page input ready for `renderPage`. */
  page: PageInput;

  /** Rendered `index.md` document. */
  markdown: string;

  /** Media files to download for the page. */
  media: MediaPlanItem[];
}

/** Options accepted by the create agent. */
export interface CreateOptions {
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
  context?: CreateContext;

  /** Timestamp used for the page date (defaults to now). */
  now?: Date;
}

/** Input accepted by {@link buildCreatePageInput}. */
export interface BuildCreatePageInputArgs {
  /** Draft returned by the model. */
  draft: CreateDraft;

  /** Source post. */
  entry: ReportEntry;

  /** Research context. */
  context: CreateContext;

  /** Selected image URLs (already reconciled with the post). */
  mediaUrls: readonly string[];

  /** Resolved page slug. */
  slug: string;

  /** Timestamp used for the page date. */
  now: Date;
}
