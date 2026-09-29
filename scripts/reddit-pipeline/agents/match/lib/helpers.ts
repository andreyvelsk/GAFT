import type { LanguageModel } from 'ai';

import { kebabCase } from '../../../shared/lib/helpers';
import type { ReportEntry } from '../../../shared/lib/types';
import { resolveModel } from '../../../engines/model/lib/helpers';
import { createProvider, generateStructured } from '../../../engines/generation/lib/helpers';
import {
  loadContentIndex,
  matchCandidates,
  type ContentCandidate,
  type ContentSearchOptions,
} from '../../../tools/content-search';
import {
  matchDecisionSchema,
  type MatchDecision,
  type MatchOptions,
} from './types';

/** Maximum number of `selftext` characters forwarded to the model. */
const MAX_SELFTEXT_LENGTH = 800;

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
  '{"action": "CREATE" | "UPDATE", "slug": "...", "reason": "..."}.',
  'The `reason` is a short English sentence explaining the decision.',
].join('\n');

/** Truncate a string to `max` characters, appending an ellipsis when cut. */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
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
    'Return ONLY a JSON object {"action": ..., "slug": ..., "reason": ...}.',
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
      return { action: 'UPDATE', slug: exact.slug, reason: decision.reason };
    }
    const only = candidates[0];
    if (candidates.length === 1 && only !== undefined) {
      return { action: 'UPDATE', slug: only.slug, reason: decision.reason };
    }
    return {
      action: 'CREATE',
      slug: requested === '' ? fallbackSlug : requested,
      reason: decision.reason,
    };
  }

  const slug = requested === '' ? fallbackSlug : requested;
  const existing = bySlug.get(slug);
  if (existing !== undefined) {
    return { action: 'UPDATE', slug: existing.slug, reason: decision.reason };
  }
  return { action: 'CREATE', slug, reason: decision.reason };
}

/** Build the content-search options from the match options. */
function toSearchOptions(options: MatchOptions): ContentSearchOptions {
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
  options: MatchOptions = {},
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

/** Decide CREATE/UPDATE for a single post. */
export async function matchPost(
  entry: ReportEntry,
  options: MatchOptions = {},
): Promise<MatchDecision> {
  const candidates = await findCandidates(entry, options);
  const model = resolveMatchModel(options);

  const response = await generateStructured({
    model,
    schema: matchDecisionSchema,
    system: MATCH_SYSTEM_PROMPT,
    prompt: buildMatchPrompt(entry, candidates),
    temperature: 0,
    schemaName: 'match_decision',
    schemaDescription:
      'Object with action (CREATE|UPDATE), a kebab-case slug and a reason',
    agent: 'match',
    ...(options.generate !== undefined ? { generate: options.generate } : {}),
    ...(options.maxRepairAttempts !== undefined
      ? { maxRepairAttempts: options.maxRepairAttempts }
      : {}),
  });

  return reconcileDecision(entry, candidates, response);
}
