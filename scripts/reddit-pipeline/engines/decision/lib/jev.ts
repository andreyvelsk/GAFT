import {
  TypeSafeClient,
  type EntryType,
  type Question as SdkQuestion,
  type Questions as SdkQuestions,
  type ScoreCriteria,
} from '@typesafe-ai/sdk';
import { z } from 'zod';

import { config } from '../../../config';
import { AgentError } from '../../../shared/lib/errors';
import { createLogger } from '../../../shared/lib/logger';
import type { Logger } from '../../../shared/lib/types';
import {
  DEFAULT_DECISIONS_BASE_URL,
  DEFAULT_DECISIONS_MODEL,
  normalizeUsage,
  validateAnswers,
  type SystemOneUsage,
} from './helpers';
import type {
  DecisionAnswer,
  DecisionPort,
  DecisionQuestion,
  DecisionResult,
} from './types';

/** Arguments passed to the injectable System One transport. */
export interface SystemOneArgs {
  /** Model that answers the request. */
  model: string;

  /** State evaluated by the model. */
  state: unknown;

  /** Questions keyed by the names used to identify their answers. */
  questions: Record<string, DecisionQuestion>;
}

/** Result returned by the injectable System One transport. */
export interface SystemOneResult {
  /** Model that produced the answers. */
  model: string;

  /** Answers keyed by question name. */
  answers: Record<string, DecisionAnswer>;

  /** Raw token usage as reported by System One. */
  usage?: SystemOneUsage;
}

/** Injectable System One transport (the TypeSafe SDK by default). */
export type SystemOneLike = (args: SystemOneArgs) => Promise<SystemOneResult>;

/** Options accepted by {@link createJevAdapter}. */
export interface JevAdapterOptions {
  /** API key override; falls back to `config.openrouter.apiKey`. */
  apiKey?: string;

  /** Base URL override; falls back to `DEFAULT_DECISIONS_BASE_URL`. */
  baseUrl?: string;

  /** Model override; falls back to `DEFAULT_DECISIONS_MODEL`. */
  model?: string;

  /** Injected transport (used by tests to avoid the network). */
  systemOne?: SystemOneLike;

  /** Structured logger (defaults to a stdout logger). */
  logger?: Logger;
}

/** A JSON-compatible value accepted by the SDK as state or criteria. */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** Recursive schema describing a JSON-compatible value. */
const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
);

/** Schema describing the SDK's `EntryType` (state/instructions/criteria). */
const entryTypeSchema = z.union([
  z.string(),
  z.record(jsonValueSchema),
  z.array(jsonValueSchema),
  z.null(),
]);

/** Convert an arbitrary state value into the SDK's entry type. */
function toEntryType(value: unknown): EntryType {
  const parsed = entryTypeSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return JSON.stringify(value);
}

/** Convert one score rubric into the SDK tuple (at least two entries). */
function toScoreCriteria(criteria: string[]): ScoreCriteria {
  const [first, second, ...rest] = criteria;
  if (first === undefined || second === undefined) {
    throw new AgentError(
      'Score question requires at least two criteria',
      'decisions',
    );
  }
  return [first, second, ...rest];
}

/** Convert one port question into the SDK question shape. */
function toSdkQuestion(question: DecisionQuestion): SdkQuestion {
  switch (question.type) {
    case 'noul':
      return question.criteria === undefined
        ? { type: 'noul', instructions: question.instructions }
        : {
            type: 'noul',
            instructions: question.instructions,
            criteria: question.criteria,
          };
    case 'choice':
      return {
        type: 'choice',
        instructions: question.instructions,
        criteria: question.criteria,
      };
    case 'score':
      return {
        type: 'score',
        instructions: question.instructions,
        criteria: toScoreCriteria(question.criteria),
      };
  }
}

/** Convert the port questions map into the SDK questions map. */
function toSdkQuestions(
  questions: Record<string, DecisionQuestion>,
): SdkQuestions {
  const converted: SdkQuestions = {};
  for (const [name, question] of Object.entries(questions)) {
    converted[name] = toSdkQuestion(question);
  }
  return converted;
}

/**
 * Build the default System One transport backed by the TypeSafe SDK. The
 * client is created lazily so that constructing the adapter never touches the
 * network or the API key.
 */
function createDefaultSystemOne(
  apiKey: string,
  baseUrl: string,
): SystemOneLike {
  let client: TypeSafeClient | undefined;
  const getClient = (): TypeSafeClient => {
    client ??= new TypeSafeClient({ apiKey, baseURL: baseUrl });
    return client;
  };
  return async (args) => {
    const result = await getClient().systemOne({
      model: args.model,
      state: toEntryType(args.state),
      questions: toSdkQuestions(args.questions),
    });
    return {
      model: result.model,
      answers: validateAnswers(result.answers),
      usage: result.usage,
    };
  };
}

/**
 * Create a {@link DecisionPort} backed by TypeSafe System One. The transport is
 * injectable, so tests can exercise the mapping without hitting the network.
 */
export function createJevAdapter(options: JevAdapterOptions = {}): DecisionPort {
  const apiKey = options.apiKey ?? config.openrouter.apiKey;
  const baseUrl = options.baseUrl ?? DEFAULT_DECISIONS_BASE_URL;
  const model = options.model ?? DEFAULT_DECISIONS_MODEL;
  const log: Logger = options.logger ?? createLogger();
  const systemOne: SystemOneLike =
    options.systemOne ?? createDefaultSystemOne(apiKey, baseUrl);

  return {
    decide: async (request): Promise<DecisionResult> => {
      log.debug('jev decision request', {
        model,
        questions: Object.keys(request.questions),
      });
      try {
        const result = await systemOne({
          model,
          state: request.state,
          questions: request.questions,
        });
        const answers = validateAnswers(result.answers);
        const usage = normalizeUsage(result.usage);
        log.debug('jev decision response', {
          model: result.model,
          answers: Object.keys(answers),
        });
        return usage === undefined
          ? { answers, model: result.model }
          : { answers, model: result.model, usage };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log.error('jev decision failed', { model, error: message });
        if (error instanceof AgentError) {
          throw error;
        }
        throw new AgentError(`Jev decision failed: ${message}`, 'decisions', {
          cause: error,
        });
      }
    },
  };
}
