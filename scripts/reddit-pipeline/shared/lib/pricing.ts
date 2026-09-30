import { z } from 'zod';

import { createLogger } from './logger';
import type { Logger, ModelUsage } from './types';

/** Price of a model in USD per 1M tokens. */
export interface ModelPrice {
  /** Price of 1M input (prompt) tokens, in USD. */
  inputPer1M: number;

  /** Price of 1M output (completion) tokens, in USD. */
  outputPer1M: number;
}

/** Lookup table of model prices. */
export interface PricingTable {
  /** Price of `model`, or `undefined` when it is not in the table. */
  get(model: string): ModelPrice | undefined;
}

/** OpenRouter endpoint listing the models and their prices. */
export const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

/**
 * Candidate ids to try when looking up a model price. The configured model may
 * carry a leading `~` (a gateway alias) or a `-latest` suffix that the pricing
 * list does not use, so the lookup degrades through the variants.
 */
export function priceCandidates(model: string): string[] {
  const withoutTilde = model.startsWith('~') ? model.slice(1) : model;
  const candidates = [
    model,
    withoutTilde,
    withoutTilde.replace(/-latest$/, ''),
    model.replace(/-latest$/, ''),
  ];
  return [...new Set(candidates.filter((value) => value !== ''))];
}

/** Schema of the OpenRouter `/models` payload (only the fields we use). */
const pricingPayloadSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.string(),
        pricing: z
          .object({
            prompt: z.union([z.string(), z.number()]).optional(),
            completion: z.union([z.string(), z.number()]).optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

/** Build a pricing table from the OpenRouter `/models` payload. */
export function buildPricingTable(payload: unknown): PricingTable {
  const map = new Map<string, ModelPrice>();
  const parsed = pricingPayloadSchema.safeParse(payload);
  if (parsed.success) {
    for (const entry of parsed.data.data ?? []) {
      const prompt = Number(entry.pricing?.prompt);
      const completion = Number(entry.pricing?.completion);
      if (!Number.isFinite(prompt) || !Number.isFinite(completion)) {
        continue;
      }
      map.set(entry.id, {
        inputPer1M: Number((prompt * 1e6).toFixed(6)),
        outputPer1M: Number((completion * 1e6).toFixed(6)),
      });
    }
  }

  return {
    get: (model): ModelPrice | undefined => {
      for (const candidate of priceCandidates(model)) {
        const price = map.get(candidate);
        if (price !== undefined) {
          return price;
        }
      }
      return undefined;
    },
  };
}

/** An empty pricing table (used when the prices could not be loaded). */
export function emptyPricingTable(): PricingTable {
  return { get: (): ModelPrice | undefined => undefined };
}

/** Estimate the cost of a call from its token usage and the model price. */
export function estimateCost(
  price: ModelPrice | undefined,
  usage: ModelUsage,
): number {
  if (price === undefined) {
    return 0;
  }
  return (
    (usage.inputTokens / 1e6) * price.inputPer1M +
    (usage.outputTokens / 1e6) * price.outputPer1M
  );
}

/** Options accepted by {@link loadPricing}. */
export interface LoadPricingOptions {
  /** Fetch implementation (used by tests). */
  fetch?: typeof fetch;

  /** Endpoint override (defaults to {@link OPENROUTER_MODELS_URL}). */
  url?: string;

  /** Structured logger (defaults to a stdout logger). */
  logger?: Logger;
}

/**
 * Fetch the OpenRouter model prices. A network or parsing failure is logged and
 * degrades to an empty table, so a run never fails because of the pricing.
 */
export async function loadPricing(
  options: LoadPricingOptions = {},
): Promise<PricingTable> {
  const doFetch = options.fetch ?? fetch;
  const url = options.url ?? OPENROUTER_MODELS_URL;
  const log = options.logger ?? createLogger();

  try {
    const response = await doFetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    const table = buildPricingTable(payload);
    log.info('pricing: loaded model prices', { url });
    return table;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn('pricing: failed to load model prices; costs will be 0', {
      url,
      error: message,
    });
    return emptyPricingTable();
  }
}
