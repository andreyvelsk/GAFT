import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { DecisionBackend, DecisionPort } from '../../../engines/decision';
import type { GenerateObjectLike, ProviderOptions } from '../../../engines/generation/lib/types';
import type { Logger, ReportEntry } from '../../../shared/lib/types';

/** Relevance verdict of a single post. */
export const filterVerdictSchema = z.object({
  /** Reddit post id. */
  id: z.string(),

  /** Whether the post describes a project relevant to the blog. */
  relevant: z.boolean(),

  /** Calibrated probability that the post is relevant (0..1), when available. */
  probability: z.number().min(0).max(1).optional(),

  /** Confidence of the relevance decision (0..1), when available. */
  confidence: z.number().min(0).max(1).optional(),
});

export type FilterVerdict = z.infer<typeof filterVerdictSchema>;

/** Batch of relevance verdicts (public output of the agent). */
export const filterVerdictsSchema = z.array(filterVerdictSchema);

export type FilterVerdicts = z.infer<typeof filterVerdictsSchema>;

/**
 * LLM-facing response schema. The root is an object with a `verdicts` array
 * because several providers (e.g. OpenAI structured outputs) do not support a
 * top-level array; the agent unwraps it into `FilterVerdicts`.
 */
export const filterResponseSchema = z.object({
  verdicts: z.array(filterVerdictSchema),
});

export type FilterResponse = z.infer<typeof filterResponseSchema>;

/** Progress info of a single classification batch. */
export interface FilterBatchInfo {
  /** Index of the batch (starting at 1). */
  batch: number;

  /** Total number of batches. */
  totalBatches: number;

  /** Number of posts in this batch. */
  posts: number;
}

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

  /** Progress callback invoked after each classified batch. */
  onBatch?: (info: FilterBatchInfo) => void;
}

/** Options accepted by {@link createFilterAgent}. */
export interface FilterAgentOptions {
  /** Backend that resolves relevance (`llm` by default, the current behaviour). */
  backend?: DecisionBackend;

  /** Jev: probability threshold above which a post is relevant. */
  threshold?: number;

  /** Injected decision port (used by tests; forces the Jev branch). */
  decision?: DecisionPort;

  /** LLM: language model override; built from `provider` when omitted. */
  model?: LanguageModel;

  /** LLM: OpenRouter provider options used to build the fallback model. */
  provider?: ProviderOptions;

  /** LLM: injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** LLM: repair attempts after the first invalid output. */
  maxRepairAttempts?: number;

  /** Structured logger shared by both backends. */
  logger?: Logger;
}

/** Relevance-classification agent selected by backend. */
export interface FilterAgent {
  /** Classify report entries into relevance verdicts. */
  classifyPosts(
    entries: readonly ReportEntry[],
    options?: FilterOptions,
  ): Promise<FilterVerdicts>;
}
