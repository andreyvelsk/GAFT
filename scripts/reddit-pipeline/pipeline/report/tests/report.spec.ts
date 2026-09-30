import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createLogger } from '../../../shared/lib/logger';
import type { Logger } from '../../../shared/lib/types';
import {
  buildReport,
  countEntries,
  createReportBuilder,
  formatReportMarkdown,
  markdownPathFor,
  summarizeReport,
  writeReport,
  writeReportMarkdown,
  type PostReportEntry,
} from '../index';

/** Fixed clock used to keep the report timestamps deterministic. */
const FIXED = new Date('2026-01-01T00:00:00.000Z');

/** Build a report entry with sensible defaults plus overrides. */
function makeEntry(overrides: Partial<PostReportEntry> = {}): PostReportEntry {
  return {
    id: 'a',
    permalink: 'https://www.reddit.com/r/AynThor/comments/a/',
    title: 'Post A',
    action: 'skipped',
    reason: 'not relevant',
    ...overrides,
  };
}

/** A logger that records the lines it would write. */
function collectLogger(): { logger: Logger; lines: string[] } {
  const lines: string[] = [];
  const logger = createLogger({
    write: (line): void => {
      lines.push(line);
    },
  });
  return { logger, lines };
}

describe('countEntries', () => {
  it('counts every action', () => {
    const counts = countEntries([
      makeEntry({ action: 'created' }),
      makeEntry({ action: 'updated' }),
      makeEntry({ action: 'skipped' }),
      makeEntry({ action: 'error' }),
      makeEntry({ action: 'created' }),
    ]);

    expect(counts).toEqual({
      total: 5,
      created: 2,
      updated: 1,
      skipped: 1,
      errors: 1,
    });
  });

  it('returns zeroed counters for an empty list', () => {
    expect(countEntries([])).toEqual({
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    });
  });
});

describe('createReportBuilder', () => {
  it('accumulates entries and builds a report with a fixed clock', () => {
    const builder = createReportBuilder({ dryRun: true, now: () => FIXED });
    builder.add(makeEntry({ action: 'created', slug: 'x' }));
    builder.add(makeEntry({ id: 'b', action: 'error', error: 'boom' }));

    const report = builder.build();

    expect(report.dryRun).toBe(true);
    expect(report.startedAt).toBe(FIXED.toISOString());
    expect(report.finishedAt).toBe(FIXED.toISOString());
    expect(report.counts).toEqual({
      total: 2,
      created: 1,
      updated: 0,
      skipped: 0,
      errors: 1,
    });
    expect(report.posts).toHaveLength(2);
  });

  it('exposes snapshots of the entries and counters', () => {
    const builder = createReportBuilder();
    builder.add(makeEntry());

    expect(builder.entries()).toHaveLength(1);
    expect(builder.counts().total).toBe(1);
  });
});

describe('buildReport', () => {
  it('builds a report from a fixed list', () => {
    const report = buildReport([makeEntry({ action: 'updated' })], {
      now: () => FIXED,
    });

    expect(report.counts.updated).toBe(1);
    expect(report.dryRun).toBe(false);
  });
});

describe('writeReport', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('writes the report as JSON and returns the path', async () => {
    dir = await mkdtemp(join(tmpdir(), 'report-'));
    const path = join(dir, 'report.json');
    const report = buildReport([makeEntry({ action: 'created' })], {
      now: () => FIXED,
    });
    const { logger, lines } = collectLogger();

    const written = await writeReport(report, { reportPath: path, logger });

    expect(written).toBe(path);
    const raw = await readFile(path, 'utf8');
    expect(raw).toBe(`${JSON.stringify(report, null, 2)}\n`);
    expect(lines.some((line) => line.includes('run report written'))).toBe(true);
  });
});

describe('summarizeReport', () => {
  it('splits skipped posts by stage and groups created/updated/errors', () => {
    const report = buildReport(
      [
        makeEntry({ id: 'p', action: 'skipped', reason: 'prefilter: flair=support' }),
        makeEntry({
          id: 'q',
          action: 'skipped',
          reason: 'prefilter: question title without project link/signal',
        }),
        makeEntry({ id: 'r', action: 'skipped', reason: 'filter: not relevant' }),
        makeEntry({ id: 's', action: 'skipped', reason: 'something else' }),
        makeEntry({ id: 'c', action: 'created', slug: 'app-c' }),
        makeEntry({ id: 'u', action: 'updated', slug: 'app-u' }),
        makeEntry({ id: 'e', action: 'error', error: 'boom' }),
      ],
      { now: () => FIXED },
    );

    const summary = summarizeReport(report);

    expect(summary.prefilter).toBe(2);
    expect(summary.filter).toBe(1);
    expect(summary.otherSkipped).toBe(1);
    expect(summary.created.map((entry) => entry.id)).toEqual(['c']);
    expect(summary.updated.map((entry) => entry.id)).toEqual(['u']);
    expect(summary.errors.map((entry) => entry.id)).toEqual(['e']);
  });

  it('returns empty groups for an empty report', () => {
    const summary = summarizeReport(buildReport([], { now: () => FIXED }));

    expect(summary).toEqual({
      prefilter: 0,
      filter: 0,
      otherSkipped: 0,
      created: [],
      updated: [],
      errors: [],
    });
  });
});

describe('markdownPathFor', () => {
  it('replaces a .json extension with .md', () => {
    expect(markdownPathFor('plans/reddit-pipeline-report.json')).toBe(
      'plans/reddit-pipeline-report.md',
    );
  });

  it('appends .md when the path has no .json extension', () => {
    expect(markdownPathFor('plans/report')).toBe('plans/report.md');
  });
});

describe('formatReportMarkdown', () => {
  it('renders counts, stage breakdown and the changed pages', () => {
    const report = buildReport(
      [
        makeEntry({
          id: 'p',
          action: 'skipped',
          reason: 'prefilter: flair=support',
        }),
        makeEntry({
          id: 'r',
          action: 'skipped',
          reason: 'filter: not relevant',
        }),
        makeEntry({
          id: 'c',
          title: 'Selaco Android port',
          action: 'created',
          slug: 'selaco',
        }),
        makeEntry({
          id: 'u',
          title: 'Wayfinder 1.0',
          action: 'updated',
          slug: 'wayfinder',
        }),
        makeEntry({ id: 'e', action: 'error', error: 'boom' }),
      ],
      { now: () => FIXED },
    );

    const markdown = formatReportMarkdown(report);

    expect(markdown).toContain('## Reddit pipeline report');
    expect(markdown).toContain('| Fetched posts | 5 |');
    expect(markdown).toContain('| Dropped by prefilter | 1 |');
    expect(markdown).toContain('| Not relevant (filter agent) | 1 |');
    expect(markdown).toContain('| Created | 1 |');
    expect(markdown).toContain('| Updated | 1 |');
    expect(markdown).toContain('| Errors | 1 |');
    expect(markdown).toContain('### Created pages (1)');
    expect(markdown).toContain('Selaco Android port → `selaco`');
    expect(markdown).toContain('### Updated pages (1)');
    expect(markdown).toContain('Wayfinder 1.0 → `wayfinder`');
    expect(markdown).toContain('### Errors (1)');
    expect(markdown).toContain('— boom');
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('flags a dry run and omits empty sections', () => {
    const report = buildReport([], { dryRun: true, now: () => FIXED });

    const markdown = formatReportMarkdown(report);

    expect(markdown).toContain('**Dry run**');
    expect(markdown).not.toContain('### Created pages');
    expect(markdown).not.toContain('### Errors');
  });

  it('renders the per-agent cost table when usage is present', () => {
    const builder = createReportBuilder({
      now: () => FIXED,
      usage: () => ({
        byAgent: [
          {
            agent: 'filter',
            model: 'typesafe/jev-1.13',
            backend: 'jev',
            calls: 2,
            inputTokens: 1000,
            outputTokens: 200,
            cost: 0.0012,
          },
          {
            agent: 'create',
            model: '~deepseek/deepseek-v4-flash-latest',
            calls: 1,
            inputTokens: 5000,
            outputTokens: 3000,
            cost: 0.05,
          },
        ],
        total: {
          calls: 3,
          inputTokens: 6000,
          outputTokens: 3200,
          cost: 0.0512,
        },
      }),
    });
    builder.add(makeEntry({ action: 'created', slug: 'x' }));

    const markdown = formatReportMarkdown(builder.build());

    expect(markdown).toContain('### Cost by model');
    expect(markdown).toContain(
      '| filter | jev | `typesafe/jev-1.13` | 2 | 1,000 | 200 | $0.001200 |',
    );
    expect(markdown).toContain(
      '| create | — | `~deepseek/deepseek-v4-flash-latest` | 1 | 5,000 | 3,000 | $0.050000 |',
    );
    expect(markdown).toContain(
      '| **Total** | | | 3 | 6,000 | 3,200 | $0.051200 |',
    );
  });

  it('omits the cost table when no usage was recorded', () => {
    const report = buildReport([], { now: () => FIXED });

    expect(formatReportMarkdown(report)).not.toContain('### Cost by model');
  });
});

describe('writeReportMarkdown', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('writes the report as Markdown and returns the path', async () => {
    dir = await mkdtemp(join(tmpdir(), 'report-md-'));
    const path = join(dir, 'report.md');
    const report = buildReport([makeEntry({ action: 'created', slug: 'x' })], {
      now: () => FIXED,
    });
    const { logger, lines } = collectLogger();

    const written = await writeReportMarkdown(report, {
      markdownPath: path,
      logger,
    });

    expect(written).toBe(path);
    const raw = await readFile(path, 'utf8');
    expect(raw).toBe(formatReportMarkdown(report));
    expect(
      lines.some((line) => line.includes('run report (markdown) written')),
    ).toBe(true);
  });
});
