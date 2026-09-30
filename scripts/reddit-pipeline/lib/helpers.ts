import { loadConfig } from '../config';
import { runPipeline } from '../pipeline/orchestrator';
import type { RunReport } from '../pipeline/report';
import { createLogger } from '../shared/lib/logger';
import {
  applyArgs,
  orchestratorOptionsFromArgs,
  parseArgs,
  USAGE,
} from './args';
import type { CliArgs, CliDependencies, CliResult } from './types';

/** Human-readable message of an unknown error. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Render a run report as a human-readable multi-line string. */
export function formatReport(report: RunReport): string {
  const { total, created, updated, skipped, errors } = report.counts;
  const lines: string[] = [
    'Reddit pipeline report',
    `  dry run: ${report.dryRun ? 'yes' : 'no'}`,
    `  started: ${report.startedAt}`,
    `  finished: ${report.finishedAt}`,
    `  counts: total=${total} created=${created} updated=${updated} skipped=${skipped} errors=${errors}`,
  ];

  if (report.posts.length > 0) {
    lines.push('  posts:');
    for (const post of report.posts) {
      const slug = post.slug !== undefined ? ` -> ${post.slug}` : '';
      const error = post.error !== undefined ? ` error=${post.error}` : '';
      lines.push(
        `    - [${post.action}] ${post.id} "${post.title}" (${post.reason})${slug}${error}`,
      );
    }
  }

  return lines.join('\n');
}

/**
 * Run the CLI: parse the command-line arguments, load the configuration,
 * apply the argument overrides, execute the pipeline and print the run report.
 *
 * Argument errors are printed (with the usage help) and reported through a
 * non-zero exit code. Fatal errors are logged; per-post errors are already
 * handled by the orchestrator.
 */
export async function runCli(deps: CliDependencies = {}): Promise<CliResult> {
  const logger = (deps.createLogger ?? createLogger)();
  const write =
    deps.write ??
    ((line: string): void => {
      process.stdout.write(`${line}\n`);
    });

  let args: CliArgs;
  try {
    args = parseArgs(deps.argv ?? []);
  } catch (error) {
    write(`error: ${errorMessage(error)}`);
    write(USAGE);
    return { exitCode: 1, result: null };
  }

  if (args.help) {
    write(USAGE);
    return { exitCode: 0, result: null };
  }

  try {
    const baseConfig = (deps.loadConfig ?? loadConfig)();
    const config = applyArgs(baseConfig, args);
    const result = await (deps.runPipeline ?? runPipeline)({
      config,
      logger,
      ...orchestratorOptionsFromArgs(args),
    });
    write(formatReport(result.report));
    return { exitCode: 0, result };
  } catch (error) {
    logger.error('pipeline run failed', { error: errorMessage(error) });
    return { exitCode: 1, result: null };
  }
}
