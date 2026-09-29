import type { LanguageModel } from 'ai';
import { z } from 'zod';

import { createLogger } from '../../../shared/lib/logger';
import type { Logger } from '../../../shared/lib/types';
import { generateStructured } from '../../generation/lib/helpers';
import type { GenerateObjectLike } from '../../generation/lib/types';
import { decisionAnswerSchema, validateAnswers } from './helpers';
import type {
  DecisionPort,
  DecisionRequest,
  DecisionResult,
} from './types';

/** System prompt describing the typed-decision task for the LLM backend. */
export const LLM_DECISION_SYSTEM_PROMPT = [
  'You answer typed decision questions about a given state.',
  '',
  'Return ONLY a JSON object of the shape {"answers": { "<question>": <answer> }}',
  'with exactly one answer for EVERY question, keyed by the exact question name.',
  '',
  'Each answer must match the shape of its question type:',
  '- noul: {"type":"noul","noul": <number between 0 and 1>}',
  '- choice: {"type":"choice","choice": <one of the criteria keys>,',
  '  "confidence": <number between 0 and 1>,',
  '  "probabilities": { "<criteria key>": <number between 0 and 1> }}',
  '- score: {"type":"score","score": <number>,',
  '  "confidence": <number between 0 and 1>,',
  '  "probabilities": { "<score>": <number between 0 and 1> }}',
  '',
  'Do not add commentary, markdown fences or extra text.',
].join('\n');

/** Schema validating the whole LLM response (answers keyed by question name). */
export const llmDecisionResponseSchema = z.object({
  answers: z.record(decisionAnswerSchema),
});

/** Options accepted by {@link createLlmDecisionAdapter}. */
export interface LlmDecisionAdapterOptions {
  /** Language model used for the call. */
  model: LanguageModel;

  /** Injected structured generator (used by tests to avoid the network). */
  generate?: GenerateObjectLike;

  /** Repair attempts after the first invalid answer (defaults to `1`). */
  maxRepairAttempts?: number;

  /** Structured logger (defaults to a stdout logger). */
  logger?: Logger;
}

/** Build the user prompt from the request state and questions. */
export function buildLlmDecisionPrompt(request: DecisionRequest): string {
  return [
    'State:',
    JSON.stringify(request.state, null, 2),
    '',
    'Questions:',
    JSON.stringify(request.questions, null, 2),
    '',
    'Answer every question and return the JSON object described above.',
  ].join('\n');
}

/**
 * Create a {@link DecisionPort} backed by an LLM through
 * {@link generateStructured}. The generator is injectable, so tests can
 * exercise the mapping and the repair-retry without hitting the network.
 */
export function createLlmDecisionAdapter(
  options: LlmDecisionAdapterOptions,
): DecisionPort {
  const log: Logger = options.logger ?? createLogger();

  return {
    decide: async (request): Promise<DecisionResult> => {
      log.debug('llm decision request', {
        questions: Object.keys(request.questions),
      });
      const response = await generateStructured({
        model: options.model,
        schema: llmDecisionResponseSchema,
        system: LLM_DECISION_SYSTEM_PROMPT,
        prompt: buildLlmDecisionPrompt(request),
        temperature: 0,
        schemaName: 'decision_answers',
        schemaDescription:
          'Object with an `answers` map keyed by question name',
        agent: 'decisions',
        ...(options.generate !== undefined
          ? { generate: options.generate }
          : {}),
        ...(options.maxRepairAttempts !== undefined
          ? { maxRepairAttempts: options.maxRepairAttempts }
          : {}),
        ...(options.logger !== undefined ? { logger: options.logger } : {}),
      });
      const answers = validateAnswers(response.answers);
      log.debug('llm decision response', { answers: Object.keys(answers) });
      return { answers, model: 'llm' };
    },
  };
}
