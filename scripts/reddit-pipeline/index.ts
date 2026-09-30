import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createLogger } from './shared/lib/logger';

/** Human-readable message of an unknown error. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Whether this module is the process entrypoint. Guards the side effect so the
 * module can be imported by tests without starting a run.
 */
function isMainModule(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) {
    return false;
  }
  const modulePath = fileURLToPath(import.meta.url);
  if (entry === modulePath) {
    return true;
  }
  try {
    return realpathSync(entry) === realpathSync(modulePath);
  } catch {
    return false;
  }
}

/**
 * Run the CLI and resolve the process exit code. The CLI is imported lazily so
 * that import-time failures (e.g. an invalid environment) are caught and logged
 * structurally instead of crashing with a raw stack trace.
 */
async function main(): Promise<number> {
  try {
    const { runCli } = await import('./lib/helpers');
    const { exitCode } = await runCli({ argv: process.argv.slice(2) });
    return exitCode;
  } catch (error) {
    createLogger().error('pipeline run failed', { error: errorMessage(error) });
    return 1;
  }
}

if (isMainModule()) {
  void main().then((exitCode) => {
    process.exitCode = exitCode;
  });
}

export type { CliDependencies, CliResult } from './lib/types';
