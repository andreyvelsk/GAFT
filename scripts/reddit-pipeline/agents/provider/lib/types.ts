import type {
  OpenRouterProvider,
  OpenRouterProviderSettings,
} from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import type { z } from 'zod';

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

  /** User prompt. */
  prompt: string;

  /** Sampling temperature. */
  temperature: number;

  /** Optional schema name passed to the provider. */
  schemaName?: string;

  /** Optional schema description passed to the provider. */
  schemaDescription?: string;
}

/** Result of a structured generation call. */
export interface GenerateObjectResultLike {
  /** Raw, not-yet-validated object returned by the model. */
  object: unknown;
}

/** Injectable structured-generation function (the AI SDK by default). */
export type GenerateObjectLike = (
  options: GenerateObjectOptions,
) => Promise<GenerateObjectResultLike>;

/** Options for `generateStructured`. */
export interface StructuredGenerationOptions<T> {
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

  /** Repair attempts after the first invalid answer (defaults to `1`). */
  maxRepairAttempts?: number;

  /** Injected structured generator (used by tests). */
  generate?: GenerateObjectLike;

  /** Agent name used in error messages. */
  agent?: string;

  /** Called before each repair attempt. */
  onRepair?: (error: unknown, attempt: number) => void;
}

export type { OpenRouterProvider, OpenRouterProviderSettings };
