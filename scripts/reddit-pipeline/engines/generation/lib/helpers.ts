import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject, type CoreMessage } from 'ai';

import { config } from '../../../config';
import { createLogger } from '../../../shared/lib/logger';
import { AgentError } from '../../../shared/lib/errors';
import type { Logger, ModelUsage } from '../../../shared/lib/types';
import type {
  GenerateObjectLike,
  GenerateObjectOptions,
  GenerateObjectResultLike,
  ObjectGenerationMode,
  OpenRouterProvider,
  OpenRouterProviderSettings,
  ProviderOptions,
  StructuredGenerationOptions,
} from './types';

/** Instruction appended to the prompt on a self-repair attempt. */
export const REPAIR_INSTRUCTION =
  '\n\nYour previous answer was not valid JSON matching the required schema. ' +
  'Reply again with ONLY a valid JSON document that matches the schema, ' +
  'without any commentary, markdown fences or extra text.';

/**
 * Object-generation mode used on self-repair attempts. The first attempt uses
 * the provider default (`auto`, usually tool calling); when that fails the
 * repair switches to JSON mode, which only needs the model to answer with a
 * JSON document instead of calling a tool.
 */
const REPAIR_MODE: ObjectGenerationMode = 'json';

/** Maximum length of a validation error embedded in a repair prompt. */
const MAX_ERROR_LENGTH = 1200;

/** Convert an unknown thrown value into a printable message. */
function errorToMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'unknown error';
  }
}

/**
 * Describe the previous failure so the repair attempt can address it
 * specifically (e.g. "too many sections") instead of only receiving the
 * generic repair instruction. Empty when there is no error to report.
 */
function describeError(error: unknown): string {
  if (error === undefined) {
    return '';
  }
  const message = errorToMessage(error);
  const trimmed =
    message.length <= MAX_ERROR_LENGTH
      ? message
      : `${message.slice(0, MAX_ERROR_LENGTH - 1)}…`;
  return `\n\nThe previous answer was rejected with: ${trimmed}`;
}

/** Default number of self-repair attempts after the first invalid answer. */
const DEFAULT_MAX_REPAIR_ATTEMPTS = 2;

/** Default sampling temperature for deterministic output. */
const DEFAULT_TEMPERATURE = 0;

/**
 * Build the OpenRouter provider settings, applying the resolved config
 * fallbacks for the API key and the base URL.
 */
export function buildProviderSettings(
  options: ProviderOptions = {},
): OpenRouterProviderSettings {
  const apiKey = options.apiKey ?? config.openrouter.apiKey;
  const baseUrl = options.baseUrl ?? config.openrouter.baseUrl;

  const settings: OpenRouterProviderSettings = {
    compatibility: options.compatibility ?? 'strict',
  };
  if (apiKey !== '') {
    settings.apiKey = apiKey;
  }
  if (baseUrl !== undefined && baseUrl !== '') {
    settings.baseURL = baseUrl;
  }
  if (options.fetch !== undefined) {
    settings.fetch = options.fetch;
  }
  if (options.headers !== undefined) {
    settings.headers = options.headers;
  }
  return settings;
}

/** Create a configured OpenRouter provider. */
export function createProvider(
  options: ProviderOptions = {},
): OpenRouterProvider {
  return createOpenRouter(buildProviderSettings(options));
}

/** Text of the most recent user message of a conversation. */
function latestUserText(messages: readonly CoreMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'user' && typeof message.content === 'string') {
      return message.content;
    }
  }
  return '';
}

/** Serialize a (possibly invalid) model answer so it can be replayed. */
function stringifyObject(object: unknown): string {
  try {
    return JSON.stringify(object);
  } catch {
    return String(object);
  }
}

/** Build the user message that reports a failed attempt (self-repair). */
function buildRepairMessage(error: unknown): string {
  return `${REPAIR_INSTRUCTION}${describeError(error)}`;
}

/** Build the argument object for the underlying generator call. */
function buildCallOptions<T>(
  options: StructuredGenerationOptions<T>,
  messages: CoreMessage[],
  temperature: number,
  mode: ObjectGenerationMode,
): GenerateObjectOptions {
  return {
    model: options.model,
    schema: options.schema,
    system: options.system,
    // Snapshot the conversation so a later attempt never mutates the history
    // already handed to the generator.
    messages: [...messages],
    prompt: latestUserText(messages),
    temperature,
    mode,
    ...(options.schemaName !== undefined
      ? { schemaName: options.schemaName }
      : {}),
    ...(options.schemaDescription !== undefined
      ? { schemaDescription: options.schemaDescription }
      : {}),
  };
}

/** Default generator backed by the AI SDK `generateObject`. */
export const defaultGenerateObject: GenerateObjectLike = async (options) => {
  const result = await generateObject({
    model: options.model,
    schema: options.schema,
    system: options.system,
    messages: options.messages,
    temperature: options.temperature,
    mode: options.mode ?? 'auto',
    ...(options.schemaName !== undefined
      ? { schemaName: options.schemaName }
      : {}),
    ...(options.schemaDescription !== undefined
      ? { schemaDescription: options.schemaDescription }
      : {}),
  });
  return {
    object: result.object,
    usage: {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    },
  };
};

/**
 * Normalize the token usage of a generation result into the shared
 * {@link ModelUsage} shape. Returns `undefined` when the generator reported no
 * usage at all. The cost is left unset: it is estimated later from the model
 * price (the OpenRouter provider does not report a cost).
 */
export function normalizeGenerationUsage(
  result: GenerateObjectResultLike,
): ModelUsage | undefined {
  const usage = result.usage;
  if (usage === undefined) {
    return undefined;
  }
  return {
    inputTokens: usage.promptTokens ?? 0,
    outputTokens: usage.completionTokens ?? 0,
  };
}

/**
 * Generate a structured object validated with `schema`.
 *
 * On invalid output (a thrown error or a failed `schema.parse`) the model is
 * asked to try again **within the same dialog**: the rejected answer (when one
 * was produced) and the concrete error are appended to the conversation, so the
 * agent can regenerate its response with full context. Self-repair attempts use
 * JSON mode, which does not require a tool call. The number of self-repair
 * attempts defaults to {@link DEFAULT_MAX_REPAIR_ATTEMPTS}.
 */
export async function generateStructured<T>(
  options: StructuredGenerationOptions<T>,
): Promise<T> {
  const generate = options.generate ?? defaultGenerateObject;
  const maxRepair = options.maxRepairAttempts ?? DEFAULT_MAX_REPAIR_ATTEMPTS;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const agent = options.agent ?? 'agent';
  const log: Logger = options.logger ?? createLogger();

  const messages: CoreMessage[] = [{ role: 'user', content: options.prompt }];
  let lastError: unknown;
  let lastObject: unknown;
  let hasObject = false;

  for (let attempt = 0; attempt <= maxRepair; attempt += 1) {
    const mode: ObjectGenerationMode =
      attempt === 0 ? options.mode ?? 'auto' : REPAIR_MODE;
    if (attempt > 0) {
      log.warn('structured generation: self-repairing in the same dialog', {
        agent,
        attempt,
        maxAttempts: maxRepair + 1,
        error: errorToMessage(lastError),
      });
    }
    hasObject = false;
    try {
      log.info('structured generation: calling model', {
        agent,
        attempt,
        maxAttempts: maxRepair + 1,
        mode,
      });
      const result = await generate(
        buildCallOptions(options, messages, temperature, mode),
      );
      const usage = normalizeGenerationUsage(result);
      if (usage !== undefined) {
        options.onUsage?.(usage);
      }
      lastObject = result.object;
      hasObject = true;
      return options.schema.parse(result.object);
    } catch (error) {
      lastError = error;
      options.onRepair?.(error, attempt);
      if (attempt < maxRepair) {
        // Continue the SAME dialog: replay the rejected answer (when the model
        // produced one) and report the error, then ask it to answer again.
        if (hasObject && lastObject !== undefined) {
          messages.push({
            role: 'assistant',
            content: stringifyObject(lastObject),
          });
        }
        messages.push({ role: 'user', content: buildRepairMessage(lastError) });
      }
    }
  }

  throw new AgentError(
    `agent "${agent}" failed to produce valid structured output after ` +
      `${maxRepair + 1} attempt(s)`,
    agent,
    { cause: lastError },
  );
}
