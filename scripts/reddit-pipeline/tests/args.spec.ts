import { describe, expect, it, vi } from 'vitest';

import type { AppConfig } from '../config/lib/types';
import {
  applyArgs,
  orchestratorOptionsFromArgs,
  parseArgs,
  USAGE,
} from '../lib/args';
import { runCli } from '../lib/helpers';
import type { CliArgs } from '../lib/types';
import type {
  OrchestratorOptions,
  OrchestratorResult,
} from '../pipeline/orchestrator';
import type { RunReport } from '../pipeline/report';
import { createLogger } from '../shared/lib/logger';
import type { Logger } from '../shared/lib/types';

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

/** Build a run report with sensible defaults. */
function makeReport(): RunReport {
  return {
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: '2026-01-01T00:00:01.000Z',
    dryRun: false,
    counts: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
    posts: [],
  };
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

describe('parseArgs', () => {
  it('returns help=false and no overrides for an empty argv', () => {
    expect(parseArgs([])).toEqual({ help: false });
  });

  it('parses fetch-window options in both --flag value and --flag=value forms', () => {
    const args = parseArgs([
      '--hours',
      '48',
      '--max-posts=5',
      '--subreddit=AynThor2',
      '--batch-size',
      '7',
    ]);

    expect(args.lookbackHours).toBe(48);
    expect(args.maxPosts).toBe(5);
    expect(args.subreddit).toBe('AynThor2');
    expect(args.batchSize).toBe(7);
  });

  it('accepts the --lookback-hours and --limit aliases', () => {
    const args = parseArgs(['--lookback-hours', '12', '--limit', '3']);
    expect(args.lookbackHours).toBe(12);
    expect(args.maxPosts).toBe(3);
  });

  it('sets all three backends for --backend', () => {
    const args = parseArgs(['--backend', 'jev']);
    expect(args.filterBackend).toBe('jev');
    expect(args.matchBackend).toBe('jev');
    expect(args.categoryBackend).toBe('jev');
  });

  it('overrides a single backend', () => {
    expect(parseArgs(['--filter-backend', 'llm']).filterBackend).toBe('llm');
    expect(parseArgs(['--match-backend', 'jev']).matchBackend).toBe('jev');
    expect(parseArgs(['--category-backend', 'jev']).categoryBackend).toBe('jev');
  });

  it('sets all five models for --model', () => {
    const args = parseArgs(['--model', 'vendor/model']);
    expect(args.filterModel).toBe('vendor/model');
    expect(args.matchModel).toBe('vendor/model');
    expect(args.createModel).toBe('vendor/model');
    expect(args.updateModel).toBe('vendor/model');
    expect(args.categoryModel).toBe('vendor/model');
  });

  it('sets all three thresholds for --threshold', () => {
    const args = parseArgs(['--threshold', '0.5']);
    expect(args.filterThreshold).toBe(0.5);
    expect(args.matchThreshold).toBe(0.5);
    expect(args.categoryThreshold).toBe(0.5);
  });

  it('parses run mode and report options', () => {
    expect(parseArgs(['--dry-run']).dryRun).toBe(true);
    expect(parseArgs(['--no-dry-run']).dryRun).toBe(false);
    expect(parseArgs(['--report', 'tmp/r.json']).reportPath).toBe('tmp/r.json');
    expect(parseArgs(['--no-report']).writeReport).toBe(false);
    expect(parseArgs(['--write-report']).writeReport).toBe(true);
  });

  it('parses the decision connection, now and help flags', () => {
    const args = parseArgs([
      '--decisions-base-url',
      'https://example.test/api',
      '--decisions-model',
      'jev-x',
      '--now',
      '2026-01-01T00:00:00.000Z',
      '--help',
    ]);
    expect(args.decisionsBaseUrl).toBe('https://example.test/api');
    expect(args.decisionsModel).toBe('jev-x');
    expect(args.now?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(args.help).toBe(true);
    expect(parseArgs(['-h']).help).toBe(true);
  });

  it('ignores positional arguments and a bare -- separator', () => {
    const args = parseArgs(['run', '--', '--hours', '6']);
    expect(args.lookbackHours).toBe(6);
  });

  it('throws on an unknown option', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(/unknown option: --bogus/);
  });

  it('throws when a value is missing', () => {
    expect(() => parseArgs(['--hours'])).toThrow(/missing value for --hours/);
  });

  it('rejects malformed numeric values', () => {
    expect(() => parseArgs(['--hours', '0'])).toThrow(/positive integer/);
    expect(() => parseArgs(['--hours', 'abc'])).toThrow(/expected a number/);
    expect(() => parseArgs(['--max-posts', '-1'])).toThrow(/non-negative/);
    expect(() => parseArgs(['--threshold', '1.5'])).toThrow(
      /between 0 and 1/,
    );
    expect(() => parseArgs(['--now', 'not-a-date'])).toThrow(/ISO-8601/);
    expect(() => parseArgs(['--backend', 'gpt'])).toThrow(/expected "jev" or "llm"/);
  });
});

describe('applyArgs', () => {
  it('returns the configuration unchanged when there are no overrides', () => {
    const config = makeConfig();
    expect(applyArgs(config, { help: false })).toEqual(config);
  });

  it('applies the overrides on top of the environment configuration', () => {
    const config = makeConfig();
    const args: CliArgs = {
      help: false,
      lookbackHours: 48,
      maxPosts: 5,
      batchSize: 3,
      subreddit: 'Other',
      dryRun: true,
      filterBackend: 'jev',
      matchBackend: 'llm',
      categoryBackend: 'jev',
      decisionsBaseUrl: 'https://example.test/api',
      decisionsModel: 'jev-x',
      filterModel: 'm/filter',
      matchModel: 'm/match',
      createModel: 'm/create',
      updateModel: 'm/update',
      categoryModel: 'm/category',
      filterThreshold: 0.1,
      matchThreshold: 0.2,
      categoryThreshold: 0.3,
    };

    const result = applyArgs(config, args);

    expect(result.reddit).toEqual({
      subreddit: 'Other',
      lookbackHours: 48,
      batchSize: 3,
      maxPosts: 5,
      dryRun: true,
    });
    expect(result.backends).toEqual({
      filter: 'jev',
      match: 'llm',
      category: 'jev',
    });
    expect(result.decisions).toEqual({
      baseUrl: 'https://example.test/api',
      model: 'jev-x',
    });
    expect(result.models).toEqual({
      filter: 'm/filter',
      match: 'm/match',
      create: 'm/create',
      update: 'm/update',
      category: 'm/category',
    });
    expect(result.thresholds).toEqual({
      filter: 0.1,
      match: 0.2,
      category: 0.3,
    });
    // Fields not covered by the CLI are preserved.
    expect(result.pr).toEqual(config.pr);
    expect(result.github).toEqual(config.github);
  });
});

describe('orchestratorOptionsFromArgs', () => {
  it('omits absent options', () => {
    expect(orchestratorOptionsFromArgs({ help: false })).toEqual({});
  });

  it('maps the report and time options', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    expect(
      orchestratorOptionsFromArgs({
        help: false,
        reportPath: 'tmp/r.json',
        writeReport: false,
        now,
      }),
    ).toEqual({ reportPath: 'tmp/r.json', writeReport: false, now });
  });
});

describe('runCli with arguments', () => {
  it('prints the usage help and exits with code 0 for --help', async () => {
    const { lines, write } = collector();
    const loadConfig = vi.fn(() => makeConfig());

    const result = await runCli({
      argv: ['--help'],
      loadConfig,
      createLogger: silentLogger,
      write,
    });

    expect(result.exitCode).toBe(0);
    expect(result.result).toBeNull();
    expect(loadConfig).not.toHaveBeenCalled();
    expect(lines.join('\n').trimEnd()).toBe(USAGE.trimEnd());
  });

  it('prints an error and the usage help for an unknown option', async () => {
    const { lines, write } = collector();

    const result = await runCli({
      argv: ['--bogus'],
      loadConfig: () => makeConfig(),
      createLogger: silentLogger,
      write,
    });

    expect(result.exitCode).toBe(1);
    expect(result.result).toBeNull();
    const output = lines.join('\n');
    expect(output).toContain('unknown option: --bogus');
    expect(output).toContain('Usage:');
  });

  it('applies the overrides to the config and the orchestrator options', async () => {
    const { write } = collector();
    let received: OrchestratorOptions | undefined;
    const runPipeline = vi.fn(
      (options: OrchestratorOptions): Promise<OrchestratorResult> => {
        received = options;
        return Promise.resolve({ report: makeReport(), reportPath: null });
      },
    );

    const result = await runCli({
      argv: [
        '--hours',
        '48',
        '--max-posts',
        '5',
        '--backend',
        'jev',
        '--dry-run',
        '--report',
        'tmp/r.json',
        '--no-report',
        '--now',
        '2026-01-01T00:00:00.000Z',
      ],
      loadConfig: () => makeConfig(),
      runPipeline,
      createLogger: silentLogger,
      write,
    });

    expect(result.exitCode).toBe(0);
    expect(received?.config?.reddit.lookbackHours).toBe(48);
    expect(received?.config?.reddit.maxPosts).toBe(5);
    expect(received?.config?.reddit.dryRun).toBe(true);
    expect(received?.config?.backends).toEqual({
      filter: 'jev',
      match: 'jev',
      category: 'jev',
    });
    expect(received?.reportPath).toBe('tmp/r.json');
    // The last flag wins: `--no-report` after `--report` disables writing.
    expect(received?.writeReport).toBe(false);
    expect(received?.now?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
});
