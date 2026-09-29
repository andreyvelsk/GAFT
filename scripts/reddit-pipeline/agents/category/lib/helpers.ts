import type { LanguageModel } from 'ai';
import { z } from 'zod';

import { config } from '../../../config';
import { createJevAdapter, type DecisionPort } from '../../../engines/decision';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { createLogger } from '../../../shared/lib/logger';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import {
  CATEGORY_DEFINITIONS,
  CATEGORY_PROMPT_GUIDE,
  PROJECT_CATEGORIES,
  projectCategorySchema,
} from '../../../content/template';
import {
  isProjectCategory,
  type ProjectCategory,
} from '../../../../../lib/categories';
import type {
  CategoryAgent,
  CategoryAgentOptions,
  CategoryContext,
} from './types';

/** Maximum number of `selftext` characters forwarded to the model. */
const MAX_SELFTEXT_LENGTH = 800;

/** Maximum number of README characters forwarded to the model. */
const MAX_README_LENGTH = 2000;

/** Category used when the decision cannot be resolved. */
const FALLBACK_CATEGORY: ProjectCategory = 'app';

/** Instructions of the Jev `choice` question. */
export const CATEGORY_CHOICE_INSTRUCTIONS = [
  'Decide which category of AYN Thor project this Reddit post describes.',
  'Choose the single category that best matches the project: a game, an app, a',
  'companion, an emulator or a tool. Use the post text, and the linked',
  'repository and README when provided, as evidence.',
].join(' ');

/** Jev alternatives: the five project categories with their definitions. */
const CATEGORY_CHOICE_CRITERIA: Record<string, string> = Object.fromEntries(
  PROJECT_CATEGORIES.map((category) => [
    category,
    CATEGORY_DEFINITIONS[category],
  ]),
);

/** System prompt describing the category-classification task. */
export const CATEGORY_SYSTEM_PROMPT = [
  'You classify posts from the r/AynThor subreddit for a blog that lists',
  'projects (games, apps, ports, emulators, tools) built for the AYN Thor',
  'handheld with its two screens.',
  '',
  'Assign each post exactly one category from the following list:',
  CATEGORY_PROMPT_GUIDE,
  '',
  'Choose the single category that best matches the concrete project the post',
  'presents. Use the post text, and the linked repository and README when',
  'provided, as evidence.',
  '',
  'Return a JSON object of the shape {"category": "..."} where the value is one',
  'of the category names listed above.',
].join('\n');

/** LLM-facing response schema (project categories only). */
const categoryResponseSchema = z.object({
  category: projectCategorySchema,
});

/** Truncate a string to `max` characters, appending an ellipsis when cut. */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Compact view of a repository sent to the model. */
function toRepoView(
  repo: NonNullable<CategoryContext['repo']>,
): { fullName: string; description: string } {
  return { fullName: repo.fullName, description: repo.description };
}

/** Build the Jev state for a post and its optional repository evidence. */
function buildCategoryState(
  entry: ReportEntry,
  context: CategoryContext,
): unknown {
  const repo = context.repo ?? null;
  const readme = context.readme ?? null;
  return {
    post: {
      id: entry.id,
      title: entry.title,
      selftext: truncate(entry.selftext, MAX_SELFTEXT_LENGTH),
      external_url: entry.external_url,
      flair: entry.flair,
    },
    repo: repo === null ? null : toRepoView(repo),
    readme: readme === null ? null : truncate(readme, MAX_README_LENGTH),
  };
}

/** Build the user prompt for a post and its optional repository evidence. */
export function buildCategoryPrompt(
  entry: ReportEntry,
  context: CategoryContext = {},
): string {
  const post = {
    id: entry.id,
    title: entry.title,
    selftext: truncate(entry.selftext, MAX_SELFTEXT_LENGTH),
    external_url: entry.external_url,
    flair: entry.flair,
  };
  const repo = context.repo ?? null;
  const readme = context.readme ?? null;

  return [
    'Classify the category of the following Reddit post.',
    'Return ONLY a JSON object {"category": "..."}.',
    '',
    'Post:',
    JSON.stringify(post, null, 2),
    '',
    'Repository (may be null):',
    JSON.stringify(repo === null ? null : toRepoView(repo), null, 2),
    '',
    'Readme (may be null):',
    JSON.stringify(
      readme === null ? null : truncate(readme, MAX_README_LENGTH),
      null,
      2,
    ),
  ].join('\n');
}

/** Resolve the language model used by the category agent. */
function resolveCategoryModel(options: CategoryAgentOptions): LanguageModel {
  if (options.model !== undefined) {
    return options.model;
  }
  const provider = createProvider(options.provider ?? {});
  return provider(resolveModel('category'));
}

/**
 * Create the LLM-backed category agent. A single structured call returns the
 * category; invalid output triggers the shared repair-retry behaviour.
 */
function createLlmCategoryAgent(options: CategoryAgentOptions): CategoryAgent {
  return {
    async classifyCategory(
      entry: ReportEntry,
      context: CategoryContext = {},
    ): Promise<ProjectCategory> {
      const model = resolveCategoryModel(options);
      const response = await generateStructured({
        model,
        schema: categoryResponseSchema,
        system: CATEGORY_SYSTEM_PROMPT,
        prompt: buildCategoryPrompt(entry, context),
        temperature: 0,
        schemaName: 'category_decision',
        schemaDescription:
          'Object with a single `category` field (game|app|companion|emulator|tool)',
        agent: 'category',
        ...(options.generate !== undefined ? { generate: options.generate } : {}),
        ...(options.maxRepairAttempts !== undefined
          ? { maxRepairAttempts: options.maxRepairAttempts }
          : {}),
      });
      return response.category;
    },
  };
}

/**
 * Create the Jev-backed category agent. Each post is sent to the decision port
 * as a single `choice` question over the five project categories. A failing
 * port, a non-choice answer or an unknown choice all fall back to `'app'`; a
 * low-confidence choice is logged but kept.
 */
function createJevCategoryAgent(
  decision: DecisionPort,
  threshold: number,
  logger: Logger,
): CategoryAgent {
  return {
    async classifyCategory(
      entry: ReportEntry,
      context: CategoryContext = {},
    ): Promise<ProjectCategory> {
      let choice: string | undefined;
      let confidence: number | undefined;
      try {
        const result = await decision.decide({
          state: buildCategoryState(entry, context),
          questions: {
            category: {
              type: 'choice',
              instructions: CATEGORY_CHOICE_INSTRUCTIONS,
              criteria: CATEGORY_CHOICE_CRITERIA,
            },
          },
        });
        const answer = result.answers.category;
        if (answer?.type === 'choice') {
          choice = answer.choice;
          confidence = answer.confidence;
        } else {
          logger.warn(
            'category: decision engine returned a non-choice answer; falling back',
            { id: entry.id, fallback: FALLBACK_CATEGORY },
          );
          return FALLBACK_CATEGORY;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('category decision failed; falling back', {
          id: entry.id,
          error: message,
          fallback: FALLBACK_CATEGORY,
        });
        return FALLBACK_CATEGORY;
      }

      if (!isProjectCategory(choice)) {
        logger.warn(
          'category: unknown choice from decision engine; falling back',
          { id: entry.id, choice, fallback: FALLBACK_CATEGORY },
        );
        return FALLBACK_CATEGORY;
      }

      if (confidence < threshold) {
        logger.warn(
          'category: low confidence from decision engine; keeping the choice',
          { id: entry.id, choice, confidence, threshold },
        );
      }

      return choice;
    },
  };
}

/**
 * Create a category agent for the requested backend. `llm` (the default) uses a
 * single structured generation call; `jev` resolves the category with a `choice`
 * question over the project categories. Passing `options.decision` selects the
 * Jev branch and injects the port (used by tests).
 */
export function createCategoryAgent(
  options: CategoryAgentOptions = {},
): CategoryAgent {
  const backend = options.backend ?? 'llm';
  if (backend === 'jev' || options.decision !== undefined) {
    const logger = options.logger ?? createLogger();
    const decision =
      options.decision ??
      createJevAdapter(
        options.logger !== undefined ? { logger: options.logger } : {},
      );
    const threshold = options.threshold ?? config.thresholds.category;
    return createJevCategoryAgent(decision, threshold, logger);
  }
  return createLlmCategoryAgent(options);
}

/**
 * Classify the category of a single post (thin wrapper over the agent, kept for
 * convenience). Uses the LLM backend.
 */
export function classifyCategory(
  entry: ReportEntry,
  options: CategoryAgentOptions = {},
  context: CategoryContext = {},
): Promise<ProjectCategory> {
  return createCategoryAgent({ ...options, backend: 'llm' }).classifyCategory(
    entry,
    context,
  );
}
