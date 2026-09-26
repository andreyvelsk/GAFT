import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { GenerateObjectLike, ProviderOptions } from '../../provider/lib/types';
import type { ContentCandidate } from '../../tools/content-search';

/** Action decided by the match agent. */
export const matchActionSchema = z.enum(['CREATE', 'UPDATE']);

export type MatchAction = z.infer<typeof matchActionSchema>;

/**
 * Decision returned by the match agent: whether to create a new page or update
 * an existing one, the target slug and a short justification.
 */
export const matchDecisionSchema = z.object({
  /** Whether the pipeline should create or update a page. */
  action: matchActionSchema,

  /** Target page slug (kebab-case). */
  slug: z.string(),

  /** Short English explanation of the decision. */
  reason: z.string(),
});

export type MatchDecision = z.infer<typeof matchDecisionSchema>;

/** Options accepted by the match agent. */
export interface MatchOptions {
  /** Pre-built language model (used by tests / callers). */
  model?: LanguageModel;

  /** OpenRouter provider settings override. */
  provider?: ProviderOptions;

  /** Injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** Number of repair attempts on invalid output (defaults to `1`). */
  maxRepairAttempts?: number;

  /** Directory holding the pages (defaults to the shared `CONTENT_DIR`). */
  contentDir?: string;

  /** Pre-loaded content index; when provided the filesystem is not read. */
  index?: readonly ContentCandidate[];
}
