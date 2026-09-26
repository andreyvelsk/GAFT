import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { GenerateObjectLike, ProviderOptions } from '../../provider/lib/types';

/** Relevance verdict of a single post. */
export const filterVerdictSchema = z.object({
  /** Reddit post id. */
  id: z.string(),

  /** Whether the post describes a project relevant to the blog. */
  relevant: z.boolean(),
});

export type FilterVerdict = z.infer<typeof filterVerdictSchema>;

/** Batch of relevance verdicts (strict JSON output of the agent). */
export const filterVerdictsSchema = z.array(filterVerdictSchema);

export type FilterVerdicts = z.infer<typeof filterVerdictsSchema>;

/** Subset of a report entry sent to the model. */
export interface FilterPostInput {
  id: string;
  title: string;
  selftext: string;
  external_url: string;
  flair: string;
}

/** Options accepted by the filter agent. */
export interface FilterOptions {
  /** Pre-built language model (used by tests / callers). */
  model?: LanguageModel;

  /** OpenRouter provider settings override. */
  provider?: ProviderOptions;

  /** Injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** Number of repair attempts on invalid output (defaults to `1`). */
  maxRepairAttempts?: number;

  /** Number of posts sent per LLM request (defaults to the config value). */
  batchSize?: number;
}
