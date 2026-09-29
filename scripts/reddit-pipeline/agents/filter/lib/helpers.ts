import type { LanguageModel } from 'ai';

import { config } from '../../../config';
import { chunk } from '../../../shared/lib/helpers';
import type { ReportEntry } from '../../../shared/lib/types';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import {
  filterResponseSchema,
  type FilterBatchInfo,
  type FilterOptions,
  type FilterPostInput,
  type FilterVerdict,
  type FilterVerdicts,
} from './types';

/** Maximum number of `selftext` characters forwarded to the model. */
const MAX_SELFTEXT_LENGTH = 800;

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

/** Truncate a string to `max` characters, appending an ellipsis when cut. */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
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

/** Classify a single batch of report entries. */
export async function classifyBatch(
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

/** Classify report entries in batches, concatenating the verdicts. */
export async function classifyPosts(
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
    verdicts.push(...(await classifyBatch(batch, options)));
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
}
