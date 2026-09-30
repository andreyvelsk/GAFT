/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';

import { createPage } from '../agents/create';
import { updatePage } from '../agents/update';
import { readContentPage } from '../tools/content-read';
import { fetchPostById, parsePostId } from '../reddit/client';
import { postToReport } from '../reddit/normalize';
import type { ReportEntry } from '../shared/lib/types';

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

/** Create a page for a single post and print the result. */
async function runCreate(url: string): Promise<void> {
  const entry = await loadEntry(url);
  const result = await createPage(entry);
  console.log('slug:', result.slug);
  console.log('repo:', result.context.repo?.fullName ?? '(none)');
  console.log('release:', result.context.release?.url ?? '(none)');
  console.log('media:', result.media);
  console.log(`--- index.md ---\n${result.markdown}`);
}

const [mode, ...rest] = process.argv.slice(2);

if (mode === 'create') {
  const fileFlag = rest.indexOf('--file');
  if (fileFlag !== -1) {
    const links = await readLinks(rest[fileFlag + 1] ?? '');
    let failures = 0;
    for (const link of links) {
      console.log(`\n=== ${link} ===`);
      try {
        await runCreate(link);
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
    await runCreate(rest[0] ?? '');
  }
} else if (mode === 'update') {
  const page = await readContentPage(rest[0] ?? '');
  if (page === null) throw new Error(`page ${rest[0]} not found`);
  const entry = await loadEntry(rest[1] ?? '');
  const result = await updatePage(page, entry);
  console.log('changed:', result.changed);
  console.log('media:', result.media);
  console.log(`--- index.md ---\n${result.markdown}`);
} else {
  console.log(
    'usage: manual-agents.ts create <url> | create --file <links.txt> | update <slug> <url>',
  );
  process.exitCode = 1;
}
