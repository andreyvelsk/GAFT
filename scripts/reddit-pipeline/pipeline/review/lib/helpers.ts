import { z } from 'zod';

import {
  DEFAULT_REVIEW_RETENTION_DAYS,
  REVIEW_FILE,
  REVIEW_MARKDOWN_FILE,
} from '../../../shared/lib/constants';
import { fileExists, readTextFile, writeTextFile } from '../../../shared/lib/fs';
import type {
  LoadReviewOptions,
  PruneReviewOptions,
  ReviewCandidate,
  ReviewLedger,
  ReviewMutationOptions,
  ReviewPost,
  SaveReviewOptions,
} from './types';

/** Milliseconds in one day (used by the retention prune). */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Schema of a single ledger entry. */
const reviewPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  permalink: z.string(),
  createdUtc: z.number(),
  firstSeenAt: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  slug: z.string().optional(),
  decidedAt: z.string().optional(),
  error: z.string().optional(),
});

/** Loose schema of the ledger envelope; entries are validated individually. */
const reviewLedgerSchema = z.object({ posts: z.array(z.unknown()) });

/** An empty ledger. */
export function emptyReviewLedger(): ReviewLedger {
  return { posts: [] };
}

/** Normalize an arbitrary parsed value into a ledger (dropping invalid entries). */
function toReviewLedger(value: unknown): ReviewLedger {
  const parsed = reviewLedgerSchema.safeParse(value);
  if (!parsed.success) {
    return emptyReviewLedger();
  }
  const posts: ReviewPost[] = [];
  for (const candidate of parsed.data.posts) {
    const result = reviewPostSchema.safeParse(candidate);
    if (result.success) {
      posts.push(result.data);
    }
  }
  return { posts };
}

/**
 * Read the review ledger from disk. A missing file yields an empty ledger; a
 * present but malformed file throws, so a corrupted ledger is not silently
 * reset.
 */
export async function loadReviewLedger(
  options: LoadReviewOptions = {},
): Promise<ReviewLedger> {
  const path = options.path ?? REVIEW_FILE;
  if (!(await fileExists(path))) {
    return emptyReviewLedger();
  }
  const raw = await readTextFile(path);
  if (raw.trim() === '') {
    return emptyReviewLedger();
  }
  const value: unknown = JSON.parse(raw);
  return toReviewLedger(value);
}

/** Apply an update to the entry with the given id, leaving the rest untouched. */
function mapReviewPost(
  ledger: ReviewLedger,
  id: string,
  update: (post: ReviewPost) => ReviewPost,
): ReviewLedger {
  return {
    posts: ledger.posts.map((post) => (post.id === id ? update(post) : post)),
  };
}

/** Copy a post without its optional `error` field. */
function withoutError(post: ReviewPost): ReviewPost {
  return {
    id: post.id,
    title: post.title,
    permalink: post.permalink,
    createdUtc: post.createdUtc,
    firstSeenAt: post.firstSeenAt,
    status: post.status,
    ...(post.slug !== undefined ? { slug: post.slug } : {}),
    ...(post.decidedAt !== undefined ? { decidedAt: post.decidedAt } : {}),
  };
}

/**
 * Upsert the given candidates into the ledger, **without overwriting** the
 * recorded decisions:
 *
 * - a new post is appended as `pending` with `firstSeenAt` set to now;
 * - an existing post keeps its `status`, `slug`, `decidedAt` and `error`, while
 *   `title`, `permalink` and `createdUtc` are refreshed.
 */
export function mergeReviewPosts(
  ledger: ReviewLedger,
  candidates: readonly ReviewCandidate[],
  options: ReviewMutationOptions = {},
): ReviewLedger {
  const now = options.now ?? ((): Date => new Date());
  const firstSeenAt = now().toISOString();
  const byId = new Map(ledger.posts.map((post) => [post.id, post]));
  const order = ledger.posts.map((post) => post.id);

  for (const candidate of candidates) {
    const existing = byId.get(candidate.id);
    if (existing === undefined) {
      byId.set(candidate.id, {
        id: candidate.id,
        title: candidate.title,
        permalink: candidate.permalink,
        createdUtc: candidate.createdUtc,
        firstSeenAt,
        status: 'pending',
      });
      order.push(candidate.id);
      continue;
    }
    byId.set(candidate.id, {
      ...existing,
      title: candidate.title,
      permalink: candidate.permalink,
      createdUtc: candidate.createdUtc,
    });
  }

  const posts = order
    .map((id) => byId.get(id))
    .filter((post): post is ReviewPost => post !== undefined);
  return { posts };
}

/** Mark a post `approved`, storing its page slug and the decision timestamp. */
export function markReviewApproved(
  ledger: ReviewLedger,
  id: string,
  slug: string,
  options: ReviewMutationOptions = {},
): ReviewLedger {
  const now = options.now ?? ((): Date => new Date());
  const decidedAt = now().toISOString();
  return mapReviewPost(ledger, id, (post) => ({
    ...withoutError(post),
    status: 'approved',
    slug,
    decidedAt,
  }));
}

/** Mark a post `rejected`, storing the decision timestamp. */
export function markReviewRejected(
  ledger: ReviewLedger,
  id: string,
  options: ReviewMutationOptions = {},
): ReviewLedger {
  const now = options.now ?? ((): Date => new Date());
  const decidedAt = now().toISOString();
  return mapReviewPost(ledger, id, (post) => ({
    ...withoutError(post),
    status: 'rejected',
    decidedAt,
  }));
}

/**
 * Record a failed approve attempt: the post stays `pending` with the error
 * message, so a later run can retry it.
 */
export function markReviewFailed(
  ledger: ReviewLedger,
  id: string,
  message: string,
): ReviewLedger {
  return mapReviewPost(ledger, id, (post) => ({
    ...post,
    status: 'pending',
    error: message,
  }));
}

/** Remove decided (`approved`/`rejected`) entries older than the retention window. */
export function pruneReviewLedger(
  ledger: ReviewLedger,
  options: PruneReviewOptions = {},
): ReviewLedger {
  const retentionDays = options.retentionDays ?? DEFAULT_REVIEW_RETENTION_DAYS;
  if (retentionDays <= 0) {
    return ledger;
  }
  const now = options.now ?? ((): Date => new Date());
  const cutoff = now().getTime() - retentionDays * MS_PER_DAY;
  const posts = ledger.posts.filter((post) => {
    if (post.status === 'pending' || post.decidedAt === undefined) {
      return true;
    }
    const decidedAt = new Date(post.decidedAt).getTime();
    return Number.isNaN(decidedAt) || decidedAt >= cutoff;
  });
  return { posts };
}

/** Render a ledger section with a custom bullet renderer. */
function appendSection(
  lines: string[],
  heading: string,
  posts: readonly ReviewPost[],
  render: (post: ReviewPost) => string,
): void {
  lines.push(`## ${heading} (${posts.length})`);
  lines.push('');
  if (posts.length === 0) {
    lines.push('_None._');
    lines.push('');
    return;
  }
  for (const post of posts) {
    lines.push(`- ${render(post)}`);
    if (post.status === 'pending' && post.error !== undefined) {
      lines.push(`  - error: ${post.error}`);
    }
  }
  lines.push('');
}

/**
 * Render the ledger as a human-readable Markdown document with Pending /
 * Approved / Rejected sections. The Pending section ends with a ready-to-copy
 * `/approved id1 id2 ...` line.
 */
export function formatReviewMarkdown(ledger: ReviewLedger): string {
  const pending = ledger.posts.filter((post) => post.status === 'pending');
  const approved = ledger.posts.filter((post) => post.status === 'approved');
  const rejected = ledger.posts.filter((post) => post.status === 'rejected');
  const lines: string[] = [];

  lines.push('# Reddit pipeline review');
  lines.push('');
  lines.push(
    `> Pending: ${pending.length} · Approved: ${approved.length} · ` +
      `Rejected: ${rejected.length}`,
  );
  lines.push('');

  appendSection(
    lines,
    'Pending',
    pending,
    (post) => `\`${post.id}\` — ${post.title} — [source](${post.permalink})`,
  );

  if (pending.length > 0) {
    lines.push('To approve, comment on this pull request:');
    lines.push('');
    lines.push('```');
    lines.push(`/approved ${pending.map((post) => post.id).join(' ')}`);
    lines.push('```');
    lines.push('');
  }

  appendSection(
    lines,
    'Approved',
    approved,
    (post) =>
      `\`${post.id}\`${post.slug !== undefined ? ` → \`${post.slug}\`` : ''} — ` +
      `${post.title} — [source](${post.permalink})`,
  );

  appendSection(
    lines,
    'Rejected',
    rejected,
    (post) => `\`${post.id}\` — ${post.title} — [source](${post.permalink})`,
  );

  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * Serialize the ledger to JSON and Markdown and write both to disk. Returns the
 * JSON path (the Markdown path is resolved from the options).
 */
export async function saveReviewLedger(
  ledger: ReviewLedger,
  options: SaveReviewOptions = {},
): Promise<string> {
  const path = options.path ?? REVIEW_FILE;
  const markdownPath = options.markdownPath ?? REVIEW_MARKDOWN_FILE;
  await writeTextFile(path, `${JSON.stringify(ledger, null, 2)}\n`);
  await writeTextFile(markdownPath, formatReviewMarkdown(ledger));
  options.logger?.info('review ledger written', {
    path,
    markdownPath,
    posts: ledger.posts.length,
  });
  return path;
}
