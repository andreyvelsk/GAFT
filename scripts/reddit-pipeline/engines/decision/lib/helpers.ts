import { z } from 'zod';

import { AgentError } from '../../../shared/lib/errors';
import type { DecisionAnswer, DecisionUsage } from './types';

/** Default System One base URL (OpenRouter-compatible gateway). */
export const DEFAULT_DECISIONS_BASE_URL = 'https://openrouter.ai/api';

/** Default System One model. */
export const DEFAULT_DECISIONS_MODEL = 'typesafe/jev-1.13';

/** Raw usage as reported by System One (snake_case; `cost` is optional). */
export interface SystemOneUsage {
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
}

/** Schema for a `noul` answer (probability within the 0..1 range). */
const noulAnswerSchema = z.object({
  type: z.literal('noul'),
  noul: z.number().min(0).max(1),
});

/** Schema for a `choice` answer (selected label plus probabilities). */
const choiceAnswerSchema = z.object({
  type: z.literal('choice'),
  choice: z.string(),
  confidence: z.number().min(0).max(1),
  probabilities: z.record(z.number()),
});

/** Schema for a `score` answer (score, confidence and optional legend). */
const scoreAnswerSchema = z.object({
  type: z.literal('score'),
  score: z.number(),
  confidence: z.number().min(0).max(1),
  probabilities: z.record(z.number()),
  legend: z.record(z.string()).optional(),
});

/** Schema validating any single answer returned by the backend. */
export const decisionAnswerSchema = z.union([
  noulAnswerSchema,
  choiceAnswerSchema,
  scoreAnswerSchema,
]);

/** Output type of {@link decisionAnswerSchema}. */
type DecisionAnswerInput = z.infer<typeof decisionAnswerSchema>;

/**
 * Normalize the snake_case System One usage into the port's camelCase shape.
 * Missing counters default to `0`; `undefined` is returned when no usage is
 * reported at all.
 */
export function normalizeUsage(
  usage?: SystemOneUsage,
): DecisionUsage | undefined {
  if (usage === undefined) {
    return undefined;
  }
  return {
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cost: usage.cost ?? 0,
  };
}

/**
 * Rebuild a validated answer, dropping an absent `legend` so the result keeps
 * the exact shape of {@link DecisionAnswer} under `exactOptionalPropertyTypes`.
 */
function toDecisionAnswer(answer: DecisionAnswerInput): DecisionAnswer {
  switch (answer.type) {
    case 'noul':
      return { type: 'noul', noul: answer.noul };
    case 'choice':
      return {
        type: 'choice',
        choice: answer.choice,
        confidence: answer.confidence,
        probabilities: answer.probabilities,
      };
    case 'score':
      return answer.legend === undefined
        ? {
            type: 'score',
            score: answer.score,
            confidence: answer.confidence,
            probabilities: answer.probabilities,
          }
        : {
            type: 'score',
            score: answer.score,
            confidence: answer.confidence,
            probabilities: answer.probabilities,
            legend: answer.legend,
          };
  }
}

/**
 * Validate every answer returned by the backend, throwing an `AgentError` on
 * the first answer that does not match its expected shape.
 */
export function validateAnswers(
  answers: Record<string, unknown>,
): Record<string, DecisionAnswer> {
  const validated: Record<string, DecisionAnswer> = {};
  for (const [name, answer] of Object.entries(answers)) {
    const parsed = decisionAnswerSchema.safeParse(answer);
    if (!parsed.success) {
      throw new AgentError(
        `Invalid decision answer for "${name}": ${parsed.error.message}`,
        'decisions',
        { cause: parsed.error },
      );
    }
    validated[name] = toDecisionAnswer(parsed.data);
  }
  return validated;
}
