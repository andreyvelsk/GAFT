import { loadConfig } from '../config';
import { runPipeline } from '../pipeline/orchestrator';
import type { RunReport } from '../pipeline/report';
import { createLogger } from '../shared/lib/logger';
import type { CliDependencies, CliResult } from './types';

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
 * Run the CLI: load the configuration, execute the pipeline and print the run
 * report. Fatal errors are logged and reported through a non-zero exit code;
 * per-post errors are already handled by the orchestrator.
 */
export async function runCli(deps: CliDependencies = {}): Promise<CliResult> {
  const logger = (deps.createLogger ?? createLogger)();
  const write =
    deps.write ??
    ((line: string): void => {
      process.stdout.write(`${line}\n`);
    });

  try {
    const config = (deps.loadConfig ?? loadConfig)();
    const result = await (deps.runPipeline ?? runPipeline)({ config, logger });
    write(formatReport(result.report));
    return { exitCode: 0, result };
  } catch (error) {
    logger.error('pipeline run failed', { error: errorMessage(error) });
    return { exitCode: 1, result: null };
  }
}
