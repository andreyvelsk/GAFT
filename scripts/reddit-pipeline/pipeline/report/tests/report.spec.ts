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
  writeReport,
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
