import type { LanguageModel } from 'ai';

import type { DecisionBackend, DecisionPort } from '../../../engines/decision';
import type { GenerateObjectLike, ProviderOptions } from '../../../engines/generation/lib/types';
import type { GitHubRepo } from '../../../github/repo';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import type { ProjectCategory } from '../../../../../lib/categories';

/**
 * Extra evidence about the post that helps disambiguate its category: the
 * GitHub repository (when one was found) and its README (when it was fetched).
 * Both are optional — the agent must classify from the post alone otherwise.
 */
export interface CategoryContext {
  /** Repository linked to the post, when resolved. */
  repo?: GitHubRepo | null;

  /** README text of the repository, when fetched (may be long). */
  readme?: string | null;
}

/** Options accepted by {@link createCategoryAgent}. */
export interface CategoryAgentOptions {
  /** Backend that resolves the category (`llm` by default). */
  backend?: DecisionBackend;

  /** Jev: confidence threshold below which a warning is logged (default 0.8). */
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

/** Category-classification agent selected by backend. */
export interface CategoryAgent {
  /** Classify a post (and optional repository evidence) into a project category. */
  classifyCategory(
    entry: ReportEntry,
    context?: CategoryContext,
  ): Promise<ProjectCategory>;
}
