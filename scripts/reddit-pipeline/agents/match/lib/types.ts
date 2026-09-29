import type { LanguageModel } from 'ai';
import { z } from 'zod';

import type { DecisionBackend, DecisionPort } from '../../../engines/decision';
import type { GenerateObjectLike, ProviderOptions } from '../../../engines/generation/lib/types';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import type { ContentCandidate } from '../../../tools/content-search';

/** Action decided by the match agent. */
export const matchActionSchema = z.enum(['CREATE', 'UPDATE']);

export type MatchAction = z.infer<typeof matchActionSchema>;

/**
 * Decision returned by the match agent: whether to create a new page or update
 * an existing one, plus the target slug.
 */
export const matchDecisionSchema = z.object({
  /** Whether the pipeline should create or update a page. */
  action: matchActionSchema,

  /** Target page slug (kebab-case). */
  slug: z.string(),
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

/** Options accepted by {@link createMatchAgent}. */
export interface MatchAgentOptions {
  /** Backend that resolves the CREATE/UPDATE decision (`llm` by default). */
  backend?: DecisionBackend;

  /** Jev: confidence threshold below which a warning is logged. */
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

  /** Directory holding the pages (defaults to the shared `CONTENT_DIR`). */
  contentDir?: string;

  /** Pre-loaded content index; when provided the filesystem is not read. */
  index?: readonly ContentCandidate[];

  /** Structured logger shared by both backends. */
  logger?: Logger;
}

/** Match agent selected by backend. */
export interface MatchAgent {
  /** Decide CREATE/UPDATE for a single post. */
  matchPost(entry: ReportEntry, options?: MatchOptions): Promise<MatchDecision>;
}
