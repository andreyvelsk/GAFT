import type {
  OpenRouterProvider,
  OpenRouterProviderSettings,
} from '@openrouter/ai-sdk-provider';
import type { CoreMessage, LanguageModel } from 'ai';
import type { z } from 'zod';

import type { Logger, ModelUsage } from '../../../shared/lib/types';

/**
 * Object-generation mode handed to the provider.
 *
 * - `auto` — the provider picks the best strategy (usually tool calling);
 * - `json` — the schema is described in the prompt and the answer is parsed
 *   from the response text (no tool call required);
 * - `tool` — a tool with the JSON schema as parameters is provided and the
 *   model must call it.
 */
export type ObjectGenerationMode = 'auto' | 'json' | 'tool';

/** Options accepted when creating the OpenRouter provider. */
export interface ProviderOptions {
  /** API key override; falls back to the resolved config. */
  apiKey?: string;

  /** Base URL override; falls back to the resolved config. */
  baseUrl?: string;

  /** Custom fetch implementation (used by tests). */
  fetch?: typeof fetch;

  /** Extra headers sent with every request. */
  headers?: Record<string, string>;

  /** OpenRouter compatibility mode (defaults to `strict`). */
  compatibility?: 'strict' | 'compatible';
}

/** Options accepted by the injectable structured generator. */
export interface GenerateObjectOptions {
  /** Language model used for the call. */
  model: LanguageModel;

  /** Schema the model output is validated against. */
  schema: z.ZodType<unknown, z.ZodTypeDef, unknown>;

  /** System instruction. */
  system: string;

  /**
   * Conversation sent to the model, in order. The system instruction is passed
   * separately. On a self-repair attempt this holds the original request, the
   * answer the model already produced (when any) and the error report, so the
   * model regenerates its answer within the SAME dialog.
   */
  messages: CoreMessage[];

  /**
   * Text of the most recent user turn (the original request on the first
   * attempt, the repair instruction afterwards). Mirrors the last user message
   * of {@link GenerateObjectOptions.messages} and is kept as a convenience.
   */
  prompt: string;

  /** Sampling temperature. */
  temperature: number;

  /** Optional schema name passed to the provider. */
  schemaName?: string;

  /** Optional schema description passed to the provider. */
  schemaDescription?: string;

  /** Object-generation mode (defaults to the provider's `auto`). */
  mode?: ObjectGenerationMode;
}

/** Token usage as reported by the underlying generator (AI SDK shape). */
export interface GenerateObjectUsageLike {
  /** Number of input (prompt) tokens. */
  promptTokens?: number;

  /** Number of output (completion) tokens. */
  completionTokens?: number;
}

/** Result of a structured generation call. */
export interface GenerateObjectResultLike {
  /** Raw, not-yet-validated object returned by the model. */
  object: unknown;

  /** Token usage of the call, when the generator reports it. */
  usage?: GenerateObjectUsageLike;
}

/** Injectable structured-generation function (the AI SDK by default). */
export type GenerateObjectLike = (
  options: GenerateObjectOptions,
) => Promise<GenerateObjectResultLike>;

/** Options for `generateStructured`. */
export interface StructuredGenerationOptions<T> {
  /** Structured logger for progress output (defaults to a stdout logger). */
  logger?: Logger;

  /** Language model used for the call. */
  model: LanguageModel;

  /** Schema used to validate the model output. */
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;

  /** System instruction. */
  system: string;

  /** User prompt. */
  prompt: string;

  /** Sampling temperature (defaults to `0`). */
  temperature?: number;

  /** Optional schema name passed to the provider. */
  schemaName?: string;

  /** Optional schema description passed to the provider. */
  schemaDescription?: string;

  /** Object-generation mode for the first attempt (defaults to `auto`). */
  mode?: ObjectGenerationMode;

  /** Self-repair attempts after the first invalid answer (defaults to `2`). */
  maxRepairAttempts?: number;

  /** Injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** Agent name used in error messages. */
  agent?: string;

  /** Called before each self-repair attempt. */
  onRepair?: (error: unknown, attempt: number) => void;

  /** Called after every model call with its token usage. */
  onUsage?: (usage: ModelUsage) => void;
}

export type { OpenRouterProvider, OpenRouterProviderSettings };
