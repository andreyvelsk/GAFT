import {
  compareCategory,
  compareFilter,
  compareMatch,
  loadCases,
  parseArgs,
  renderCategoryReport,
  renderFilterReport,
  renderMatchReport,
  type CliArgs,
  type CompareRunOptions,
} from './compare-backends/index';
import { createLogger } from '../shared/lib/logger';

/** Parse the CLI arguments, printing a clear error and exiting on failure. */
function parseArgsOrExit(argv: readonly string[]): CliArgs {
  try {
    return parseArgs(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`invalid arguments: ${message}`);
    process.exit(1);
  }
}

/** Run the selected backend comparison and print the report to stdout. */
async function main(): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY ?? '';
  if (apiKey.trim() === '') {
    console.error(
      'OPENROUTER_API_KEY is not set. The comparison harness calls both the Jev and the LLM backends; set the key in the environment or in .env.',
    );
    process.exit(1);
  }

  const args = parseArgsOrExit(process.argv.slice(2));
  const logger = createLogger();
  const options: CompareRunOptions = {
    ...(args.threshold !== undefined ? { threshold: args.threshold } : {}),
    ...(args.limit !== undefined ? { limit: args.limit } : {}),
    logger,
  };

  logger.info('compare-backends: start', {
    agent: args.agent,
    threshold: args.threshold ?? 'default',
    limit: args.limit ?? 'all',
  });

  const cases = await loadCases(options);
  if (cases.length === 0) {
    logger.warn('no posts loaded; nothing to compare');
    return;
  }
  logger.info('loaded posts', { count: cases.length });

  let lines: string[];
  if (args.agent === 'filter') {
    lines = renderFilterReport(await compareFilter(cases, options));
  } else if (args.agent === 'match') {
    lines = renderMatchReport(await compareMatch(cases, options));
  } else {
    lines = renderCategoryReport(await compareCategory(cases, options));
  }

  for (const line of lines) {
    logger.info(line);
  }
}

await main();
