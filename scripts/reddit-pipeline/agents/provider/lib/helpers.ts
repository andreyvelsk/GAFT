import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from 'ai';

import { config } from '../../../config';
import { AgentError } from '../../../shared/lib/errors';
import type {
  GenerateObjectLike,
  GenerateObjectOptions,
  OpenRouterProvider,
  OpenRouterProviderSettings,
  ProviderOptions,
  StructuredGenerationOptions,
} from './types';

/** Instruction appended to the prompt on a repair attempt. */
export const REPAIR_INSTRUCTION =
  '\n\nYour previous answer was not valid JSON matching the required schema. ' +
  'Reply again with ONLY a valid JSON document that matches the schema, ' +
  'without any commentary, markdown fences or extra text.';

/** Default number of repair attempts after the first invalid answer. */
const DEFAULT_MAX_REPAIR_ATTEMPTS = 1;

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

/** Build the argument object for the underlying generator call. */
function buildCallOptions<T>(
  options: StructuredGenerationOptions<T>,
  prompt: string,
  temperature: number,
): GenerateObjectOptions {
  return {
    model: options.model,
    schema: options.schema,
    system: options.system,
    prompt,
    temperature,
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
    prompt: options.prompt,
    temperature: options.temperature,
    ...(options.schemaName !== undefined
      ? { schemaName: options.schemaName }
      : {}),
    ...(options.schemaDescription !== undefined
      ? { schemaDescription: options.schemaDescription }
      : {}),
  });
  return { object: result.object };
};

/**
 * Generate a structured object validated with `schema`.
 * On invalid output (thrown error or a failed `schema.parse`) the call is
 * retried with a repair instruction appended to the prompt.
 */
export async function generateStructured<T>(
  options: StructuredGenerationOptions<T>,
): Promise<T> {
  const generate = options.generate ?? defaultGenerateObject;
  const maxRepair = options.maxRepairAttempts ?? DEFAULT_MAX_REPAIR_ATTEMPTS;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const agent = options.agent ?? 'agent';

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRepair; attempt += 1) {
    const prompt =
      attempt === 0 ? options.prompt : `${options.prompt}${REPAIR_INSTRUCTION}`;
    try {
      const result = await generate(
        buildCallOptions(options, prompt, temperature),
      );
      return options.schema.parse(result.object);
    } catch (error) {
      lastError = error;
      options.onRepair?.(error, attempt);
    }
  }

  throw new AgentError(
    `agent "${agent}" failed to produce valid structured output after ` +
      `${maxRepair + 1} attempt(s)`,
    agent,
    { cause: lastError },
  );
}
