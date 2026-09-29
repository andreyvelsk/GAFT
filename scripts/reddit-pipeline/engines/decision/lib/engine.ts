import type { LanguageModel } from 'ai';

import type { Logger } from '../../../shared/lib/types';
import { createProvider } from '../../generation/lib/helpers';
import type {
  GenerateObjectLike,
  ProviderOptions,
} from '../../generation/lib/types';
import { resolveModel } from '../../model/lib/helpers';
import { createJevAdapter, type SystemOneLike } from './jev';
import { createLlmDecisionAdapter } from './llm';
import type { DecisionBackend, DecisionPort } from './types';

/** Options accepted by {@link createDecisionEngine}. */
export interface DecisionEngineOptions {
  /** Backend that resolves decisions (defaults to `jev`). */
  backend?: DecisionBackend;

  /** Jev: API key override; falls back to `config.openrouter.apiKey`. */
  apiKey?: string;

  /** Jev: base URL override; falls back to `DEFAULT_DECISIONS_BASE_URL`. */
  baseUrl?: string;

  /** Jev: model override; falls back to `DEFAULT_DECISIONS_MODEL`. */
  decisionModel?: string;

  /** Jev: injected System One transport (used by tests). */
  systemOne?: SystemOneLike;

  /** LLM: language model override; built from `provider` when omitted. */
  model?: LanguageModel;

  /** LLM: OpenRouter provider options used to build the fallback model. */
  provider?: ProviderOptions;

  /** LLM: injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** LLM: repair attempts after the first invalid answer. */
  maxRepairAttempts?: number;

  /** Structured logger shared by both adapters. */
  logger?: Logger;
}

/**
 * Create a {@link DecisionPort} for the requested backend. `jev` (the default)
 * uses TypeSafe System One; `llm` uses the OpenRouter chat backend with the
 * `filter` model as the fallback when no explicit model is provided.
 */
export function createDecisionEngine(
  options: DecisionEngineOptions = {},
): DecisionPort {
  const backend = options.backend ?? 'jev';

  if (backend === 'llm') {
    const model =
      options.model ?? createProvider(options.provider ?? {})(resolveModel('filter'));
    return createLlmDecisionAdapter({
      model,
      ...(options.generate !== undefined
        ? { generate: options.generate }
        : {}),
      ...(options.maxRepairAttempts !== undefined
        ? { maxRepairAttempts: options.maxRepairAttempts }
        : {}),
      ...(options.logger !== undefined ? { logger: options.logger } : {}),
    });
  }

  return createJevAdapter({
    ...(options.apiKey !== undefined ? { apiKey: options.apiKey } : {}),
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    ...(options.decisionModel !== undefined
      ? { model: options.decisionModel }
      : {}),
    ...(options.systemOne !== undefined ? { systemOne: options.systemOne } : {}),
    ...(options.logger !== undefined ? { logger: options.logger } : {}),
  });
}
