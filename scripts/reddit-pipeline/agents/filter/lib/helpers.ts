import type { LanguageModel } from 'ai';

import { config } from '../../../config';
import { createJevAdapter, type DecisionPort } from '../../../engines/decision';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { chunk } from '../../../shared/lib/helpers';
import { createLogger } from '../../../shared/lib/logger';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import {
  filterResponseSchema,
  type FilterAgent,
  type FilterAgentOptions,
  type FilterBatchInfo,
  type FilterOptions,
  type FilterPostInput,
  type FilterVerdict,
  type FilterVerdicts,
} from './types';

/**
 * Maximum number of `selftext` characters forwarded to the model.
 * `0` disables truncation and forwards the full text.
 */
const MAX_SELFTEXT_LENGTH = 0;

/** System prompt describing the relevance-classification task. */
export const FILTER_SYSTEM_PROMPT = [
  'You classify posts from the r/AynThor subreddit for a blog that lists',
  'projects (games, apps, ports, emulators, tools) built for the AYN Thor',
  'handheld with its two screens.',
  '',
  'A post is RELEVANT when it presents a concrete project the author built or',
  'released for the device: a game, an app, a port, an emulator, a launcher, a',
  'tool, or a companion utility. Links to a repository, release, download or',
  'screenshot are strong positive signals.',
  '',
  'A post is NOT relevant when it is a question, a support request, a help',
  'request, a shipping/delivery update, a purchase advice thread, a poll, a',
  'meme, a photo of the device, a general discussion, or news with no project.',
  '',
  'A post is also NOT relevant when it is a work-in-progress announcement, a',
  'teaser, or a "working on something" post that has no downloadable release,',
  'APK, repository, or other link to a finished project. Mere intent to build,',
  'progress updates, or "coming soon" posts are NOT relevant, even when they',
  'describe what the project will do or show it running.',
  '',
  'Return a JSON object of the shape {"verdicts": [ ... ]} with one object per',
  'input post, in the SAME order as the input, using the exact input `id` and a',
  'boolean `relevant` field.',
].join('\n');

/** Jev instructions reworded from {@link FILTER_SYSTEM_PROMPT}. */
const FILTER_NOUL_INSTRUCTIONS = [
  'Decide whether this Reddit post presents a concrete project (a game, an app,',
  'a port, an emulator, a launcher, a tool or a companion utility) built or',
  'released for the AYN Thor handheld with its two screens. Report the',
  'probability that a blog listing such projects should include this post.',
].join(' ');

/** Both outcomes of the Jev relevance question, reworded from the prompt. */
export const FILTER_NOUL_CRITERIA: { true: string; false: string } = {
  true: [
    'The post presents a concrete project the author built or released for the',
    'AYN Thor (a game, an app, a port, an emulator, a launcher, a tool or a',
    'companion utility), with a repository, release, download or screenshot link.',
  ].join(' '),
  false: [
    'The post is a question, a support or help request, a shipping/delivery',
    'update, a purchase advice thread, a poll, a meme, a device photo, a general',
    'discussion or news with no project; or a work-in-progress announcement, a',
    'teaser or a "coming soon" post without a downloadable release, APK or',
    'repository link.',
  ].join(' '),
};

/**
 * Truncate a string to `max` characters, appending an ellipsis when cut.
 * A non-positive `max` disables truncation and returns the text unchanged.
 */
function truncate(text: string, max: number): string {
  return max <= 0 || text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Map a report entry onto the compact shape sent to the model. */
function toPostInput(entry: ReportEntry): FilterPostInput {
  return {
    id: entry.id,
    title: entry.title,
    selftext: truncate(entry.selftext, MAX_SELFTEXT_LENGTH),
    external_url: entry.external_url,
    flair: entry.flair,
  };
}

/** Build the user prompt for a batch of report entries. */
export function buildFilterPrompt(entries: readonly ReportEntry[]): string {
  const posts = entries.map((entry) => toPostInput(entry));
  return [
    'Classify the relevance of each of the following Reddit posts.',
    'Return ONLY a JSON object {"verdicts": [...]}, one object per post,',
    'preserving the input order.',
    '',
    JSON.stringify(posts, null, 2),
  ].join('\n');
}

/**
 * Reconcile the model verdicts with the input entries: the result always has
 * the same length and order as the input, and any missing id defaults to
 * `relevant: false`.
 */
export function reconcileVerdicts(
  entries: readonly ReportEntry[],
  verdicts: readonly FilterVerdict[],
): FilterVerdicts {
  const relevantById = new Map<string, boolean>();
  for (const verdict of verdicts) {
    relevantById.set(verdict.id, verdict.relevant);
  }
  return entries.map((entry) => ({
    id: entry.id,
    relevant: relevantById.get(entry.id) ?? false,
  }));
}

/** Resolve the language model used by the filter agent. */
function resolveFilterModel(options: FilterOptions): LanguageModel {
  if (options.model !== undefined) {
    return options.model;
  }
  const provider = createProvider(options.provider ?? {});
  return provider(resolveModel('filter'));
}

/** Classify a single batch of report entries with the LLM backend. */
async function classifyBatchLlm(
  entries: readonly ReportEntry[],
  options: FilterOptions = {},
): Promise<FilterVerdicts> {
  if (entries.length === 0) {
    return [];
  }

  const model = resolveFilterModel(options);
  const response = await generateStructured({
    model,
    schema: filterResponseSchema,
    system: FILTER_SYSTEM_PROMPT,
    prompt: buildFilterPrompt(entries),
    temperature: 0,
    schemaName: 'filter_verdicts',
    schemaDescription:
      'Object with a `verdicts` array (id + boolean) for every input post',
    agent: 'filter',
    ...(options.generate !== undefined ? { generate: options.generate } : {}),
    ...(options.maxRepairAttempts !== undefined
      ? { maxRepairAttempts: options.maxRepairAttempts }
      : {}),
  });

  return reconcileVerdicts(entries, response.verdicts);
}

/**
 * Merge agent-level and per-call options, the per-call value taking precedence.
 * Only defined values are copied so the result stays compatible with
 * `exactOptionalPropertyTypes`.
 */
function mergeFilterOptions(
  agentOptions: FilterAgentOptions,
  callOptions: FilterOptions,
): FilterOptions {
  const model = callOptions.model ?? agentOptions.model;
  const provider = callOptions.provider ?? agentOptions.provider;
  const generate = callOptions.generate ?? agentOptions.generate;
  const maxRepairAttempts =
    callOptions.maxRepairAttempts ?? agentOptions.maxRepairAttempts;
  return {
    ...(model !== undefined ? { model } : {}),
    ...(provider !== undefined ? { provider } : {}),
    ...(generate !== undefined ? { generate } : {}),
    ...(maxRepairAttempts !== undefined ? { maxRepairAttempts } : {}),
  };
}

/** Create the LLM-backed filter agent (the existing behaviour, unchanged). */
function createLlmFilterAgent(options: FilterAgentOptions): FilterAgent {
  return {
    async classifyPosts(
      entries: readonly ReportEntry[],
      callOptions: FilterOptions = {},
    ): Promise<FilterVerdicts> {
      if (entries.length === 0) {
        return [];
      }

      const batchSize = callOptions.batchSize ?? config.reddit.batchSize;
      const batches = chunk(entries, batchSize);
      const merged = mergeFilterOptions(options, callOptions);
      const verdicts: FilterVerdict[] = [];
      for (const [index, batch] of batches.entries()) {
        verdicts.push(...(await classifyBatchLlm(batch, merged)));
        if (callOptions.onBatch !== undefined) {
          const info: FilterBatchInfo = {
            batch: index + 1,
            totalBatches: batches.length,
            posts: batch.length,
          };
          callOptions.onBatch(info);
        }
      }
      return verdicts;
    },
  };
}

/**
 * Classify a single post with the decision port. A failure of the port must not
 * fail the whole batch: the error is logged and the post is treated as not
 * relevant (consistent with the `reconcileVerdicts` default).
 */
async function classifyEntryJev(
  entry: ReportEntry,
  decision: DecisionPort,
  threshold: number,
  logger: Logger,
): Promise<FilterVerdict> {
  try {
    const result = await decision.decide({
      state: toPostInput(entry),
      questions: {
        relevant: {
          type: 'noul',
          instructions: FILTER_NOUL_INSTRUCTIONS,
          criteria: FILTER_NOUL_CRITERIA,
        },
      },
    });
    const answer = result.answers.relevant;
    if (answer?.type !== 'noul') {
      return { id: entry.id, relevant: false };
    }
    return {
      id: entry.id,
      relevant: answer.noul >= threshold,
      probability: answer.noul,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('filter decision failed; treating post as not relevant', {
      id: entry.id,
      error: message,
    });
    return { id: entry.id, relevant: false };
  }
}

/**
 * Create the Jev-backed filter agent. Every post is classified with its own
 * decision request; `relevant` is `noul >= threshold` and the calibrated
 * probability is recorded in the verdict (a noul answer carries no confidence).
 */
function createJevFilterAgent(
  decision: DecisionPort,
  threshold: number,
  logger: Logger,
): FilterAgent {
  return {
    async classifyPosts(
      entries: readonly ReportEntry[],
      options: FilterOptions = {},
    ): Promise<FilterVerdicts> {
      if (entries.length === 0) {
        return [];
      }

      const batchSize = options.batchSize ?? config.reddit.batchSize;
      const batches = chunk(entries, batchSize);
      const verdicts: FilterVerdict[] = [];
      for (const [index, batch] of batches.entries()) {
        for (const entry of batch) {
          verdicts.push(
            await classifyEntryJev(entry, decision, threshold, logger),
          );
        }
        if (options.onBatch !== undefined) {
          const info: FilterBatchInfo = {
            batch: index + 1,
            totalBatches: batches.length,
            posts: batch.length,
          };
          options.onBatch(info);
        }
      }
      return verdicts;
    },
  };
}

/**
 * Create a filter agent for the requested backend. `llm` (the default) keeps
 * the existing batch-classification behaviour; `jev` classifies each post with
 * a `noul` question over the decision port. Passing `options.decision` selects
 * the Jev branch and injects the port (used by tests).
 */
export function createFilterAgent(options: FilterAgentOptions = {}): FilterAgent {
  const backend = options.backend ?? 'llm';
  if (backend === 'jev' || options.decision !== undefined) {
    const logger = options.logger ?? createLogger();
    const decision =
      options.decision ??
      createJevAdapter(options.logger !== undefined ? { logger: options.logger } : {});
    const threshold = options.threshold ?? config.thresholds.filter;
    return createJevFilterAgent(decision, threshold, logger);
  }
  return createLlmFilterAgent(options);
}

/**
 * Classify a single batch of report entries (thin wrapper over the agent, kept
 * for backward compatibility). The whole input is sent as one batch.
 */
export function classifyBatch(
  entries: readonly ReportEntry[],
  options: FilterOptions = {},
): Promise<FilterVerdicts> {
  return createFilterAgent({ backend: 'llm' }).classifyPosts(entries, {
    ...options,
    batchSize: entries.length === 0 ? 1 : entries.length,
  });
}

/**
 * Classify report entries in batches (thin wrapper over the agent, kept for
 * backward compatibility).
 */
export function classifyPosts(
  entries: readonly ReportEntry[],
  options: FilterOptions = {},
): Promise<FilterVerdicts> {
  return createFilterAgent({ backend: 'llm' }).classifyPosts(entries, options);
}
