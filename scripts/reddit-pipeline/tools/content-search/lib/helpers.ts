import type { Dirent } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parseFrontmatter } from '../../../content/frontmatter';
import {
  normalizeName,
  parseRepoRef,
  type GitHubRepoRef,
} from '../../../github/repo';
import { CONTENT_DIR } from '../../../shared/lib/constants';
import type { ContentCandidate, ContentSearchOptions } from './types';

/** File name of a page inside its slug directory. */
const PAGE_FILE = 'index.md';

/** Minimum length of a normalized fragment before substring matching kicks in. */
const MIN_FRAGMENT_LENGTH = 4;

/** Relevance scores of the individual matching strategies. */
const SCORE = {
  repoUrl: 100,
  slug: 90,
  title: 80,
  titleContains: 60,
  queryContainsTitle: 50,
} as const;

/** Extract the canonical project URL from a page body. */
export function extractProjectUrl(content: string): string {
  const labelled = /See the project page:\s*\[[^\]]*\]\(([^)\s]+)\)/i.exec(
    content,
  );
  if (labelled?.[1] !== undefined) {
    return labelled[1];
  }
  const github = /https?:\/\/github\.com\/[^\s)\]]+/i.exec(content);
  return github?.[0] ?? '';
}

/** Extract the source Reddit permalink from a page body. */
export function extractSourceUrl(content: string): string {
  const labelled = /source:\s*\[[^\]]*\]\(([^)\s]+)\)/i.exec(content);
  return labelled?.[1] ?? '';
}

/** Read a string field from parsed frontmatter, falling back to `fallback`. */
function stringField(
  data: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = data[key];
  return typeof value === 'string' ? value : fallback;
}

/** Read a directory, returning an empty list when it does not exist. */
async function readDirSafe(dir: string): Promise<Dirent[]> {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** Read a file as UTF-8, returning `null` when it cannot be read. */
async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Load every page of the content database into a flat index.
 * A pre-loaded `index` short-circuits the filesystem access (used by tests).
 */
export async function loadContentIndex(
  options: ContentSearchOptions = {},
): Promise<ContentCandidate[]> {
  if (options.index !== undefined) {
    return [...options.index];
  }

  const dir = options.contentDir ?? CONTENT_DIR;
  const entries = await readDirSafe(dir);
  const candidates: ContentCandidate[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const path = join(dir, entry.name, PAGE_FILE);
    const raw = await readFileSafe(path);
    if (raw === null) {
      continue;
    }
    const { data, content } = parseFrontmatter(raw);
    candidates.push({
      slug: stringField(data, 'slug', entry.name),
      title: stringField(data, 'title', ''),
      description: stringField(data, 'description', ''),
      path,
      projectUrl: extractProjectUrl(content),
      sourceUrl: extractSourceUrl(content),
    });
  }

  return candidates;
}

/** Whether two repository references point at the same `owner/repo`. */
function sameRepo(a: GitHubRepoRef, b: GitHubRepoRef): boolean {
  return (
    a.owner.toLowerCase() === b.owner.toLowerCase() &&
    a.repo.toLowerCase() === b.repo.toLowerCase()
  );
}

/** Score a candidate against a query; `0` means no match. */
function scoreCandidate(
  query: string,
  ref: GitHubRepoRef | null,
  candidate: ContentCandidate,
): number {
  let score = 0;

  if (ref !== null && candidate.projectUrl !== '') {
    const candidateRef = parseRepoRef(candidate.projectUrl);
    if (candidateRef !== null && sameRepo(candidateRef, ref)) {
      score = Math.max(score, SCORE.repoUrl);
    }
  }

  const normalizedQuery = normalizeName(query);
  if (normalizedQuery === '') {
    return score;
  }

  const normalizedSlug = normalizeName(candidate.slug);
  const normalizedTitle = normalizeName(candidate.title);

  if (normalizedQuery === normalizedSlug) {
    score = Math.max(score, SCORE.slug);
  }
  if (normalizedQuery === normalizedTitle) {
    score = Math.max(score, SCORE.title);
  }
  if (
    normalizedQuery.length >= MIN_FRAGMENT_LENGTH &&
    normalizedTitle.includes(normalizedQuery)
  ) {
    score = Math.max(score, SCORE.titleContains);
  }
  if (
    normalizedTitle.length >= MIN_FRAGMENT_LENGTH &&
    normalizedQuery.includes(normalizedTitle)
  ) {
    score = Math.max(score, SCORE.queryContainsTitle);
  }

  return score;
}

/**
 * Match a query (project name or GitHub URL) against a content index.
 * Results are ordered by descending relevance.
 */
export function matchCandidates(
  query: string,
  index: readonly ContentCandidate[],
): ContentCandidate[] {
  const trimmed = query.trim();
  if (trimmed === '') {
    return [];
  }

  const ref = parseRepoRef(trimmed);
  const scored: { candidate: ContentCandidate; score: number }[] = [];

  for (const candidate of index) {
    const score = scoreCandidate(trimmed, ref, candidate);
    if (score > 0) {
      scored.push({ candidate, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.candidate);
}

/** Search the content database for pages matching a query. */
export async function searchContent(
  query: string,
  options: ContentSearchOptions = {},
): Promise<ContentCandidate[]> {
  const index = await loadContentIndex(options);
  return matchCandidates(query, index);
}
