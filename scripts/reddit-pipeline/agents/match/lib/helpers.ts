import type { LanguageModel } from 'ai';

import { config } from '../../../config';
import { createJevAdapter, type DecisionPort } from '../../../engines/decision';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { kebabCase } from '../../../shared/lib/helpers';
import { createLogger } from '../../../shared/lib/logger';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import {
  loadContentIndex,
  matchCandidates,
  type ContentCandidate,
  type ContentSearchOptions,
} from '../../../tools/content-search';
import {
  matchDecisionSchema,
  type MatchAgent,
  type MatchAgentOptions,
  type MatchDecision,
  type MatchOptions,
} from './types';

/**
 * Maximum number of `selftext` characters forwarded to the model.
 * `0` disables truncation and forwards the full text.
 */
const MAX_SELFTEXT_LENGTH = 0;

/** Criteria key selecting a brand-new project (CREATE) in the Jev branch. */
export const MATCH_NEW_OPTION = '__new__';

/** Criterion text describing the {@link MATCH_NEW_OPTION} alternative. */
const MATCH_NEW_CRITERION = 'A project that is not among the candidates';

/** Instructions of the Jev `choice` question. */
const MATCH_CHOICE_INSTRUCTIONS = [
  'Decide which existing content page corresponds to this Reddit post about an',
  'AYN Thor project. Choose the slug of the matching page, or choose',
  `"${MATCH_NEW_OPTION}" when the post describes a project that is not among`,
  'the candidates.',
].join(' ');

/** System prompt describing the CREATE/UPDATE decision task. */
export const MATCH_SYSTEM_PROMPT = [
  'You decide how the blog pipeline should handle a Reddit post about an AYN',
  'Thor project: create a new page or update an existing one.',
  '',
  'You are given the post and a list of existing content pages ("candidates")',
  'found by a deterministic search. Use ONLY the provided candidates — never',
  'invent a page that is not in the list.',
  '',
  'Choose UPDATE when the post clearly refers to the same project as one of the',
  'candidates: the same repository, the same project name, or the same author’s',
  'project. Set `slug` to the exact slug of that candidate.',
  '',
  'Choose CREATE when the post describes a project that is not among the',
  'candidates. Set `slug` to a new kebab-case slug derived from the project name',
  '(lowercase ASCII words separated by single hyphens).',
  '',
  'Return a JSON object of the shape',
  '{"action": "CREATE" | "UPDATE", "slug": "..."}.',
].join('\n');

/**
 * Truncate a string to `max` characters, appending an ellipsis when cut.
 * A non-positive `max` disables truncation and returns the text unchanged.
 */
function truncate(text: string, max: number): string {
  return max <= 0 || text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Compact view of a candidate sent to the model. */
function toCandidateView(candidate: ContentCandidate): {
  slug: string;
  title: string;
  description: string;
  projectUrl: string;
} {
  return {
    slug: candidate.slug,
    title: candidate.title,
    description: candidate.description,
    projectUrl: candidate.projectUrl,
  };
}

/** Single-line criterion describing a candidate in the Jev `choice` question. */
function toCriterion(candidate: ContentCandidate): string {
  return `${candidate.title} — ${candidate.description} (${candidate.projectUrl})`;
}

/** Build the user prompt for a post and its candidate pages. */
export function buildMatchPrompt(
  entry: ReportEntry,
  candidates: readonly ContentCandidate[],
): string {
  const post = {
    id: entry.id,
    title: entry.title,
    selftext: truncate(entry.selftext, MAX_SELFTEXT_LENGTH),
    external_url: entry.external_url,
    flair: entry.flair,
  };
  const views = candidates.map((candidate) => toCandidateView(candidate));

  return [
    'Decide whether to CREATE a new page or UPDATE an existing one for this post.',
    'Return ONLY a JSON object {"action": ..., "slug": ...}.',
    '',
    'Post:',
    JSON.stringify(post, null, 2),
    '',
    'Existing content candidates (may be empty):',
    JSON.stringify(views, null, 2),
  ].join('\n');
}

/**
 * Reconcile the model decision with the deterministic candidate list:
 *
 * - `UPDATE` keeps the slug only when it matches a candidate; with a single
 *   candidate the candidate slug is used; otherwise the decision is downgraded
 *   to `CREATE` (the model must not update a page that was not found).
 * - `CREATE` normalizes the slug to kebab-case and is downgraded to `UPDATE`
 *   when the resulting slug already exists (prevents duplicate pages).
 */
export function reconcileDecision(
  entry: ReportEntry,
  candidates: readonly ContentCandidate[],
  decision: MatchDecision,
): MatchDecision {
  const bySlug = new Map(
    candidates.map((candidate) => [candidate.slug, candidate]),
  );
  const requested = kebabCase(decision.slug);
  const fallbackSlug = kebabCase(entry.title);

  if (decision.action === 'UPDATE') {
    const exact = bySlug.get(requested);
    if (exact !== undefined) {
      return { action: 'UPDATE', slug: exact.slug };
    }
    const only = candidates[0];
    if (candidates.length === 1 && only !== undefined) {
      return { action: 'UPDATE', slug: only.slug };
    }
    return {
      action: 'CREATE',
      slug: requested === '' ? fallbackSlug : requested,
    };
  }

  const slug = requested === '' ? fallbackSlug : requested;
  const existing = bySlug.get(slug);
  if (existing !== undefined) {
    return { action: 'UPDATE', slug: existing.slug };
  }
  return { action: 'CREATE', slug };
}

/** Build the content-search options from a subset of the match options. */
function toSearchOptions(options: {
  contentDir?: string;
  index?: readonly ContentCandidate[];
}): ContentSearchOptions {
  return {
    ...(options.contentDir !== undefined
      ? { contentDir: options.contentDir }
      : {}),
    ...(options.index !== undefined ? { index: options.index } : {}),
  };
}

/**
 * Deterministically gather candidate pages for a post. The post is searched by
 * its title, its body (`selftext`) and its external URL — the project name and
 * the repository link often live in the body rather than the title. Results are
 * de-duplicated by slug.
 */
export async function findCandidates(
  entry: ReportEntry,
  options: {
    contentDir?: string;
    index?: readonly ContentCandidate[];
  } = {},
): Promise<ContentCandidate[]> {
  const index = await loadContentIndex(toSearchOptions(options));
  const merged = new Map<string, ContentCandidate>();

  const queries = [entry.title, entry.selftext, entry.external_url];
  for (const query of queries) {
    if (query === '') {
      continue;
    }
    for (const candidate of matchCandidates(query, index)) {
      merged.set(candidate.slug, candidate);
    }
  }

  return [...merged.values()];
}

/** Resolve the language model used by the match agent. */
function resolveMatchModel(options: MatchOptions): LanguageModel {
  if (options.model !== undefined) {
    return options.model;
  }
  const provider = createProvider(options.provider ?? {});
  return provider(resolveModel('match'));
}

/**
 * Merge agent-level and per-call options, the per-call value taking precedence.
 * Only defined values are copied so the result stays compatible with
 * `exactOptionalPropertyTypes`.
 */
function mergeMatchOptions(
  agentOptions: MatchAgentOptions,
  callOptions: MatchOptions,
): MatchOptions {
  const model = callOptions.model ?? agentOptions.model;
  const provider = callOptions.provider ?? agentOptions.provider;
  const generate = callOptions.generate ?? agentOptions.generate;
  const maxRepairAttempts =
    callOptions.maxRepairAttempts ?? agentOptions.maxRepairAttempts;
  const contentDir = callOptions.contentDir ?? agentOptions.contentDir;
  const index = callOptions.index ?? agentOptions.index;
  return {
    ...(model !== undefined ? { model } : {}),
    ...(provider !== undefined ? { provider } : {}),
    ...(generate !== undefined ? { generate } : {}),
    ...(maxRepairAttempts !== undefined ? { maxRepairAttempts } : {}),
    ...(contentDir !== undefined ? { contentDir } : {}),
    ...(index !== undefined ? { index } : {}),
  };
}

/** Create the LLM-backed match agent (the existing behaviour, unchanged). */
function createLlmMatchAgent(options: MatchAgentOptions): MatchAgent {
  return {
    async matchPost(
      entry: ReportEntry,
      callOptions: MatchOptions = {},
    ): Promise<MatchDecision> {
      const merged = mergeMatchOptions(options, callOptions);
      const candidates = await findCandidates(entry, merged);
      const model = resolveMatchModel(merged);

      const response = await generateStructured({
        model,
        schema: matchDecisionSchema,
        system: MATCH_SYSTEM_PROMPT,
        prompt: buildMatchPrompt(entry, candidates),
        temperature: 0,
        schemaName: 'match_decision',
        schemaDescription:
          'Object with action (CREATE|UPDATE) and a kebab-case slug',
        agent: 'match',
        ...(merged.generate !== undefined ? { generate: merged.generate } : {}),
        ...(merged.maxRepairAttempts !== undefined
          ? { maxRepairAttempts: merged.maxRepairAttempts }
          : {}),
      });

      return reconcileDecision(entry, candidates, response);
    },
  };
}

/**
 * Create the Jev-backed match agent. Each post is sent to the decision port as a
 * single `choice` question over the deterministic candidates plus a
 * {@link MATCH_NEW_OPTION} alternative; `reconcileDecision` then maps the chosen
 * option onto a CREATE/UPDATE decision. A failing port, a non-choice answer or
 * an unknown slug all fall back to CREATE (a new page).
 */
function createJevMatchAgent(
  decision: DecisionPort,
  threshold: number,
  logger: Logger,
  options: MatchAgentOptions,
): MatchAgent {
  return {
    async matchPost(
      entry: ReportEntry,
      callOptions: MatchOptions = {},
    ): Promise<MatchDecision> {
      const search: {
        contentDir?: string;
        index?: readonly ContentCandidate[];
      } = {};
      const contentDir = callOptions.contentDir ?? options.contentDir;
      const index = callOptions.index ?? options.index;
      if (contentDir !== undefined) {
        search.contentDir = contentDir;
      }
      if (index !== undefined) {
        search.index = index;
      }

      const candidates = await findCandidates(entry, search);
      const criteria: Record<string, string> = {};
      for (const candidate of candidates) {
        criteria[candidate.slug] = toCriterion(candidate);
      }
      criteria[MATCH_NEW_OPTION] = MATCH_NEW_CRITERION;

      const state = {
        post: {
          id: entry.id,
          title: entry.title,
          selftext: truncate(entry.selftext, MAX_SELFTEXT_LENGTH),
          external_url: entry.external_url,
          flair: entry.flair,
        },
        candidates: candidates.map((candidate) => toCandidateView(candidate)),
      };

      let choice: string | undefined;
      let confidence: number | undefined;
      try {
        const result = await decision.decide({
          state,
          questions: {
            match: {
              type: 'choice',
              instructions: MATCH_CHOICE_INSTRUCTIONS,
              criteria,
            },
          },
        });
        const answer = result.answers.match;
        if (answer?.type === 'choice') {
          choice = answer.choice;
          confidence = answer.confidence;
        } else {
          logger.warn(
            'match: decision engine returned a non-choice answer; treating as CREATE',
            { id: entry.id },
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('match decision failed; treating as CREATE', {
          id: entry.id,
          error: message,
        });
      }

      if (
        choice !== undefined &&
        confidence !== undefined &&
        confidence < threshold
      ) {
        logger.warn(
          'match: low confidence from decision engine; keeping the choice',
          { id: entry.id, choice, confidence, threshold },
        );
      }

      const known =
        choice !== undefined &&
        Object.prototype.hasOwnProperty.call(criteria, choice);
      if (choice !== undefined && !known) {
        logger.warn(
          'match: unknown choice from decision engine; treating as CREATE',
          { id: entry.id, choice },
        );
      }

      const requested: MatchDecision =
        choice !== undefined && known && choice !== MATCH_NEW_OPTION
          ? { action: 'UPDATE', slug: choice }
          : { action: 'CREATE', slug: '' };

      return reconcileDecision(entry, candidates, requested);
    },
  };
}

/**
 * Create a match agent for the requested backend. `llm` (the default) keeps the
 * existing structured-generation behaviour; `jev` resolves the CREATE/UPDATE
 * decision with a `choice` question over the deterministic candidates. Passing
 * `options.decision` selects the Jev branch and injects the port (used by
 * tests).
 */
export function createMatchAgent(options: MatchAgentOptions = {}): MatchAgent {
  const backend = options.backend ?? 'llm';
  if (backend === 'jev' || options.decision !== undefined) {
    const logger = options.logger ?? createLogger();
    const decision =
      options.decision ??
      createJevAdapter(options.logger !== undefined ? { logger: options.logger } : {});
    const threshold = options.threshold ?? config.thresholds.match;
    return createJevMatchAgent(decision, threshold, logger, options);
  }
  return createLlmMatchAgent(options);
}

/**
 * Decide CREATE/UPDATE for a single post (thin wrapper over the agent, kept for
 * backward compatibility). Uses the LLM backend.
 */
export function matchPost(
  entry: ReportEntry,
  options: MatchOptions = {},
): Promise<MatchDecision> {
  return createMatchAgent({ backend: 'llm' }).matchPost(entry, options);
}
