/**
 * Temporary script for manually verifying filtering via Jev (not committed).
 *
 * Accepts a Reddit post URL and prints every intermediate stage:
 *   1. Reddit response (raw post from reddit/client).
 *   2. Normalized report entry (reddit/normalize).
 *   3. JSON request built for Jev (state + questions) — assembled by the
 *      filter agent (agents/filter), intercepted by this script via an
 *      injected DecisionPort.
 *   4. JSON response from Jev (answers + model + usage) from engines/decision.
 *   5. Final filter verdict (relevant + probability).
 *
 * Usage:
 *   npx tsx scripts/reddit-pipeline/scripts/manual-filter.ts <reddit-url>
 *   npx tsx scripts/reddit-pipeline/scripts/manual-filter.ts <reddit-url> --json
 *
 * Example:
 *   npx tsx scripts/reddit-pipeline/scripts/manual-filter.ts \
 *     https://www.reddit.com/r/AynThor/comments/1abcde/some_post/
 */
/* eslint-disable no-console */

import { createFilterAgent } from '../agents/filter';
import { createJevAdapter, type DecisionPort } from '../engines/decision';
import { fetchPostById, parsePostId } from '../reddit/client';
import { postToReport } from '../reddit/normalize';
import { config } from '../config';
import type { ReportEntry } from '../shared/lib/types';

/** Parsed command line arguments. */
interface CliOptions {
  url: string;
  json: boolean;
}

/** Parse command line arguments manually (no dependencies). */
function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { url: '', json: false };
  for (const arg of argv) {
    if (arg === '--json') {
      options.json = true;
    } else if (options.url === '') {
      options.url = arg;
    }
  }
  return options;
}

/** Print a stage header. */
function section(title: string): void {
  console.log(`\n${'='.repeat(72)}\n${title}\n${'='.repeat(72)}`);
}

/** Print a value as JSON (or compact when `--json` is set). */
function dump(label: string, value: unknown, json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ stage: label, value }));
    return;
  }
  console.log(`\n--- ${label} ---`);
  console.log(JSON.stringify(value, null, 2));
}

/**
 * Wrap the real Jev port with a logging one: it prints the exact request built
 * by the filter agent and the Jev response, then delegates the call.
 */
function withLogging(
  inner: DecisionPort,
  json: boolean,
): DecisionPort {
  return {
    async decide(request): Promise<Awaited<ReturnType<DecisionPort['decide']>>> {
      dump('JEV REQUEST (state + questions)', request, json);
      const result = await inner.decide(request);
      dump('JEV RESPONSE (answers + model + usage)', result, json);
      return result;
    },
  };
}

/** Entry point. */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.url === '') {
    console.log(
      'Usage: npx tsx scripts/reddit-pipeline/scripts/manual-filter.ts <reddit-url> [--json]',
    );
    process.exitCode = 1;
    return;
  }

  const id = parsePostId(options.url);
  if (id === null) {
    console.error(`Could not extract post id from URL: ${options.url}`);
    process.exitCode = 1;
    return;
  }

  if (!options.json) {
    console.log(`URL: ${options.url}`);
    console.log(`Post ID: ${id}`);
    console.log(`Filter backend: jev`);
    console.log(`Decision model: ${config.decisions.model}`);
    console.log(`Threshold: ${config.thresholds.filter}`);
  }

  // Stage 1: raw Reddit response.
  section('1. REDDIT RESPONSE (raw post)');
  const post = await fetchPostById(id);
  if (post === null) {
    console.error(`Post ${id} was not found in any source.`);
    process.exitCode = 1;
    return;
  }
  dump('RAW POST', post, options.json);

  // Stage 2: normalize into a report entry.
  section('2. NORMALIZED REPORT ENTRY');
  const entry: ReportEntry = postToReport(post);
  dump('REPORT ENTRY', entry, options.json);

  // Stages 3-4: the filter agent builds the request, the logging port prints
  // it, and the real Jev adapter responds.
  section('3-4. JEV REQUEST / RESPONSE');
  const decision = withLogging(createJevAdapter(), options.json);
  const agent = createFilterAgent({ backend: 'jev', decision });

  // Stage 5: final verdict.
  section('5. FILTER VERDICT');
  const verdicts = await agent.classifyPosts([entry]);
  dump('VERDICTS', verdicts, options.json);

  if (!options.json) {
    const verdict = verdicts[0];
    const probability =
      verdict?.probability !== undefined
        ? ` (probability=${verdict.probability})`
        : '';
    console.log(
      `\nResult: ${verdict?.relevant === true ? 'RELEVANT' : 'NOT RELEVANT'}${probability}`,
    );
  }
}

await main();
