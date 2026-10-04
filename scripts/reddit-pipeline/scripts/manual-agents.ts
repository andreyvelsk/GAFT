/**
 * Manual runner for the create/update agents on a single post (not committed).
 *
 * Usage (direct):
 *   npx tsx scripts/reddit-pipeline/scripts/manual-agents.ts create <url>
 *   npx tsx scripts/reddit-pipeline/scripts/manual-agents.ts create <url> --write
 *   npx tsx scripts/reddit-pipeline/scripts/manual-agents.ts create --file <links.txt>
 *   npx tsx scripts/reddit-pipeline/scripts/manual-agents.ts create --file <links.txt> --write
 *   npx tsx scripts/reddit-pipeline/scripts/manual-agents.ts update <slug> <url>
 *   npx tsx scripts/reddit-pipeline/scripts/manual-agents.ts update <slug> <url> --write
 *
 * Usage (via npm — note the `--` before the script arguments, otherwise npm
 * swallows the `--write` flag and the script runs in dry-run mode):
 *   npm run reddit:create -- <url>
 *   npm run reddit:create -- <url> --write
 *   npm run reddit:create -- --file <links.txt> --write
 *   npm run reddit:update -- <slug> <url>
 *   npm run reddit:update -- <slug> <url> --write
 *
 * Scenarios:
 *   create <url>                — generate a page and print the result.
 *   create <url> --write        — generate and write content/<slug>/index.md,
 *                                 and download media into public/content/<slug>/.
 *   create --file <links.txt>   — batch-process links from a file
 *                                 (one per line; blank lines and `#` are ignored).
 *   update <slug> <url>         — update an existing page and print the result.
 *   update <slug> <url> --write — update and write the page to disk.
 *
 * Without the `--write` flag the script runs in dry-run mode: it writes nothing
 * to disk and only prints the generated `index.md` to the console.
 */
/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { createPage, type CreateResult } from '../agents/create';
import { updatePage, type UpdateResult } from '../agents/update';
import { downloadMediaPlan } from '../content/media';
import { renderPage, withoutMediaFiles } from '../content/template';
import { readContentPage } from '../tools/content-read';
import { fetchPostById, parsePostId } from '../reddit/client';
import { postToReport } from '../reddit/normalize';
import {
  CONTENT_DIR,
  PUBLIC_CONTENT_DIR,
} from '../shared/lib/constants';
import { writeTextFile } from '../shared/lib/fs';
import type { ReportEntry } from '../shared/lib/types';

/** File name of a page inside its slug directory. */
const PAGE_FILE = 'index.md';

async function loadEntry(url: string): Promise<ReportEntry> {
  const id = parsePostId(url);
  if (id === null) throw new Error(`cannot parse post id from ${url}`);
  const post = await fetchPostById(id);
  if (post === null) throw new Error(`post ${id} not found`);
  return postToReport(post);
}

/** Read a newline-separated list of links, ignoring blanks and comments. */
async function readLinks(path: string): Promise<string[]> {
  const raw = await readFile(path, 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
}

/**
 * Persist a generated page: download its media (best-effort) and write
 * `content/<slug>/index.md`. Broken images are skipped and dropped from the
 * frontmatter instead of aborting the write.
 */
async function persist(result: CreateResult | UpdateResult): Promise<void> {
  const failed = await downloadMediaPlan(result.media, {
    slug: result.slug,
    publicContentDir: PUBLIC_CONTENT_DIR,
    onMedia: ({ fileName, index, total }) => {
      console.log(`media ${index}/${total}: ${fileName}`);
    },
    onMediaError: ({ fileName, error }) => {
      console.error(`media failed: ${fileName}: ${error}`);
    },
  });
  const markdown =
    failed.size === 0
      ? result.markdown
      : renderPage(withoutMediaFiles(result.page, failed));
  const path = join(CONTENT_DIR, result.slug, PAGE_FILE);
  await writeTextFile(path, markdown);
  console.log('written:', path);
}

/** Create a page for a single post and print (or write) the result. */
async function runCreate(url: string, write: boolean): Promise<void> {
  const entry = await loadEntry(url);
  const result = await createPage(entry);
  console.log('slug:', result.slug);
  console.log('repo:', result.context.repo?.fullName ?? '(none)');
  console.log('release:', result.context.release?.url ?? '(none)');
  console.log('media:', result.media);
  if (write) {
    await persist(result);
  } else {
    console.log(`--- index.md ---\n${result.markdown}`);
  }
}

/** Update an existing page from a single post and print (or write) the result. */
async function runUpdate(
  slug: string,
  url: string,
  write: boolean,
): Promise<void> {
  const page = await readContentPage(slug);
  if (page === null) throw new Error(`page ${slug} not found`);
  const entry = await loadEntry(url);
  const result = await updatePage(page, entry);
  console.log('changed:', result.changed);
  console.log('media:', result.media);
  if (write) {
    await persist(result);
  } else {
    console.log(`--- index.md ---\n${result.markdown}`);
  }
}

/** Collect positional arguments, dropping `--write` and the `--file` value. */
function positionals(args: string[]): string[] {
  const result: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) continue;
    if (arg === '--write') continue;
    if (arg === '--file') {
      index += 1;
      continue;
    }
    result.push(arg);
  }
  return result;
}

const argv = process.argv.slice(2);
const mode = argv[0] ?? '';
const write = argv.includes('--write');
const fileFlag = argv.indexOf('--file');
const filePath = fileFlag !== -1 ? argv[fileFlag + 1] : undefined;
const args = positionals(argv.slice(1));

if (mode === 'create') {
  if (filePath !== undefined) {
    const links = await readLinks(filePath);
    let failures = 0;
    for (const link of links) {
      console.log(`\n=== ${link} ===`);
      try {
        await runCreate(link, write);
      } catch (error) {
        failures += 1;
        const reason =
          error instanceof Error ? error.message : 'unknown error';
        console.error(`failed for ${link}: ${reason}`);
      }
    }
    if (failures > 0) {
      console.error(`\n${failures}/${links.length} post(s) failed.`);
      process.exitCode = 1;
    }
  } else {
    await runCreate(args[0] ?? '', write);
  }
} else if (mode === 'update') {
  await runUpdate(args[0] ?? '', args[1] ?? '', write);
} else {
  console.log(
    'usage: manual-agents.ts create <url> [--write] | create --file <links.txt> [--write] | update <slug> <url> [--write]',
  );
  process.exitCode = 1;
}
