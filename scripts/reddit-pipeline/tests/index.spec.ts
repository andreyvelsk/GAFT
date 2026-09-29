import { execFile, type ExecFileException } from 'node:child_process';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import type { AppConfig } from '../config/lib/types';
import { formatReport, runCli } from '../lib/helpers';
import type { OrchestratorOptions, OrchestratorResult } from '../pipeline/orchestrator';
import type { RunReport } from '../pipeline/report';
import { PROJECT_ROOT } from '../shared/lib/constants';
import { createLogger } from '../shared/lib/logger';
import type { Logger } from '../shared/lib/types';

/** Whether the process-level integration tests should run. */
const RUN_INTEGRATION = process.env.RUN_MEDIA_INTEGRATION === 'true';

/** Build a resolved configuration with sensible defaults plus overrides. */
function makeConfig(overrides: Partial<AppConfig['reddit']> = {}): AppConfig {
  return {
    openrouter: { apiKey: '', baseUrl: undefined, defaultModel: 'test/model' },
    decisions: { baseUrl: 'https://openrouter.ai/api', model: 'test/jev' },
    backends: { filter: 'llm', match: 'llm', category: 'llm' },
    thresholds: { filter: 0.8, match: 0.8, category: 0.8 },
    models: {
      filter: 'test/model',
      match: 'test/model',
      create: 'test/model',
      update: 'test/model',
      category: 'test/model',
    },
    reddit: {
      subreddit: 'AynThor',
      lookbackHours: 24,
      batchSize: 10,
      maxPosts: 0,
      dryRun: false,
      ...overrides,
    },
    pr: { branch: 'reddit-pipeline/auto', base: 'main', labels: [] },
    github: { token: '' },
  };
}

/** Build a run report with sensible defaults plus overrides. */
function makeReport(overrides: Partial<RunReport> = {}): RunReport {
  return {
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: '2026-01-01T00:00:01.000Z',
    dryRun: false,
    counts: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
    posts: [],
    ...overrides,
  };
}

/** Wrap a report into an orchestrator result. */
function makeResult(report: RunReport): OrchestratorResult {
  return { report, reportPath: null };
}

/** A logger that discards its output. */
function silentLogger(): Logger {
  return createLogger({ write: (): void => undefined });
}

/** Collect printed lines into an array. */
function collector(): { lines: string[]; write: (line: string) => void } {
  const lines: string[] = [];
  return {
    lines,
    write: (line: string): void => {
      lines.push(line);
    },
  };
}

describe('formatReport', () => {
  it('renders counts and per-post details including slug and error', () => {
    const report = makeReport({
      counts: { total: 3, created: 1, updated: 1, skipped: 0, errors: 1 },
      posts: [
        {
          id: 'a',
          permalink: 'https://reddit.com/a',
          title: 'A',
          action: 'created',
          reason: 'new',
          slug: 'a',
        },
        {
          id: 'b',
          permalink: 'https://reddit.com/b',
          title: 'B',
          action: 'updated',
          reason: 'release',
          slug: 'b',
        },
        {
          id: 'c',
          permalink: 'https://reddit.com/c',
          title: 'C',
          action: 'error',
          reason: 'processing failed',
          error: 'boom',
        },
      ],
    });

    const output = formatReport(report);

    expect(output).toContain('Reddit pipeline report');
    expect(output).toContain('created=1 updated=1 skipped=0 errors=1');
    expect(output).toContain('[created] a "A" (new) -> a');
    expect(output).toContain('[updated] b "B" (release) -> b');
    expect(output).toContain('[error] c "C" (processing failed) error=boom');
  });

  it('omits the posts section when there are no entries', () => {
    const output = formatReport(makeReport());
    expect(output).toContain('total=0');
    expect(output).not.toContain('posts:');
  });
});

describe('runCli', () => {
  it('prints the report and exits with code 0 on success', async () => {
    const { lines, write } = collector();
    const report = makeReport({
      counts: { total: 1, created: 1, updated: 0, skipped: 0, errors: 0 },
      posts: [
        {
          id: 'a',
          permalink: 'https://reddit.com/a',
          title: 'Post A',
          action: 'created',
          reason: 'new',
          slug: 'a',
        },
      ],
    });
    const runPipeline = vi.fn(
      (_options: OrchestratorOptions): Promise<OrchestratorResult> =>
        Promise.resolve(makeResult(report)),
    );

    const result = await runCli({
      loadConfig: () => makeConfig(),
      runPipeline,
      createLogger: silentLogger,
      write,
    });

    expect(result.exitCode).toBe(0);
    expect(result.result?.report).toBe(report);
    expect(runPipeline).toHaveBeenCalledTimes(1);
    const output = lines.join('\n');
    expect(output).toContain('Reddit pipeline report');
    expect(output).toContain('created=1');
    expect(output).toContain('[created] a "Post A" (new) -> a');
  });

  it('passes the dry-run flag to the orchestrator without writing files', async () => {
    const { lines, write } = collector();
    let received: AppConfig | undefined;
    const runPipeline = vi.fn(
      (options: OrchestratorOptions): Promise<OrchestratorResult> => {
        received = options.config;
        return Promise.resolve(makeResult(makeReport({ dryRun: true })));
      },
    );

    const result = await runCli({
      loadConfig: () => makeConfig({ dryRun: true }),
      runPipeline,
      createLogger: silentLogger,
      write,
    });

    expect(result.exitCode).toBe(0);
    expect(received?.reddit.dryRun).toBe(true);
    expect(runPipeline).toHaveBeenCalledTimes(1);
    expect(lines.join('\n')).toContain('dry run: yes');
  });

  it('exits with code 0 when there are no changes', async () => {
    const { lines, write } = collector();

    const result = await runCli({
      loadConfig: () => makeConfig(),
      runPipeline: () => Promise.resolve(makeResult(makeReport())),
      createLogger: silentLogger,
      write,
    });

    expect(result.exitCode).toBe(0);
    expect(result.result?.report.counts.total).toBe(0);
    expect(lines.join('\n')).toContain('total=0');
  });

  it('logs a fatal error and exits with a non-zero code', async () => {
    const logs: string[] = [];
    const logger = createLogger({
      write: (line: string): void => {
        logs.push(line);
      },
    });

    const result = await runCli({
      loadConfig: () => makeConfig(),
      runPipeline: () => Promise.reject(new Error('boom')),
      createLogger: () => logger,
      write: (): void => undefined,
    });

    expect(result.exitCode).toBe(1);
    expect(result.result).toBeNull();
    const output = logs.join('\n');
    expect(output).toContain('pipeline run failed');
    expect(output).toContain('boom');
  });

  it('exits with a non-zero code when the configuration is invalid', async () => {
    const logs: string[] = [];
    const logger = createLogger({
      write: (line: string): void => {
        logs.push(line);
      },
    });

    const result = await runCli({
      loadConfig: () => {
        throw new Error('bad config');
      },
      createLogger: () => logger,
      write: (): void => undefined,
    });

    expect(result.exitCode).toBe(1);
    expect(result.result).toBeNull();
    expect(logs.join('\n')).toContain('bad config');
  });
});

/** Run the CLI entrypoint as a child process and capture its outcome. */
function runEntrypoint(env: NodeJS.ProcessEnv): Promise<{
  code: number;
  stdout: string;
  stderr: string;
}> {
  const entry = join(PROJECT_ROOT, 'scripts', 'reddit-pipeline', 'index.ts');
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      ['--import', 'tsx', entry],
      { cwd: PROJECT_ROOT, env, timeout: 120_000 },
      (
        error: ExecFileException | null,
        stdout: string,
        stderr: string,
      ): void => {
        const code =
          error === null
            ? 0
            : typeof error.code === 'number'
              ? error.code
              : 1;
        resolve({ code, stdout, stderr });
      },
    );
  });
}

describe.skipIf(!RUN_INTEGRATION)('CLI entrypoint (integration)', () => {
  it('runs the entrypoint as a process in dry-run mode', async () => {
    const { code, stdout } = await runEntrypoint({
      ...process.env,
      REDDIT_DRY_RUN: 'true',
      REDDIT_LOOKBACK_HOURS: '1',
      REDDIT_MAX_POSTS: '0',
    });

    expect(code).toBe(0);
    expect(stdout).toContain('Reddit pipeline report');
  });

  it('exits with a non-zero code and logs structurally on invalid config', async () => {
    const { code, stdout } = await runEntrypoint({
      ...process.env,
      REDDIT_LOOKBACK_HOURS: 'abc',
    });

    expect(code).toBe(1);
    expect(stdout).toContain('pipeline run failed');
  });
});
