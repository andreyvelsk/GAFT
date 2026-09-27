import { REPORT_FILE } from '../../../shared/lib/constants';
import { writeTextFile } from '../../../shared/lib/fs';
import type {
  PostReportEntry,
  ReportBuilder,
  ReportBuilderOptions,
  ReportCounts,
  RunReport,
  WriteReportOptions,
} from './types';

/** Count the entries by action. */
export function countEntries(
  entries: readonly PostReportEntry[],
): ReportCounts {
  const counts: ReportCounts = {
    total: entries.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };
  for (const entry of entries) {
    if (entry.action === 'created') {
      counts.created += 1;
    } else if (entry.action === 'updated') {
      counts.updated += 1;
    } else if (entry.action === 'skipped') {
      counts.skipped += 1;
    } else {
      counts.errors += 1;
    }
  }
  return counts;
}

/** Create a builder that accumulates per-post entries. */
export function createReportBuilder(
  options: ReportBuilderOptions = {},
): ReportBuilder {
  const now = options.now ?? ((): Date => new Date());
  const startedAt = now().toISOString();
  const entries: PostReportEntry[] = [];

  return {
    add: (entry): void => {
      entries.push(entry);
    },
    entries: (): PostReportEntry[] => [...entries],
    counts: (): ReportCounts => countEntries(entries),
    build: (): RunReport => ({
      startedAt,
      finishedAt: now().toISOString(),
      dryRun: options.dryRun ?? false,
      counts: countEntries(entries),
      posts: [...entries],
    }),
  };
}

/** Build a run report from a fixed list of entries. */
export function buildReport(
  entries: readonly PostReportEntry[],
  options: ReportBuilderOptions = {},
): RunReport {
  const builder = createReportBuilder(options);
  for (const entry of entries) {
    builder.add(entry);
  }
  return builder.build();
}

/** Serialize a run report to JSON and write it to disk. */
export async function writeReport(
  report: RunReport,
  options: WriteReportOptions = {},
): Promise<string> {
  const path = options.reportPath ?? REPORT_FILE;
  await writeTextFile(path, `${JSON.stringify(report, null, 2)}\n`);
  options.logger?.info('run report written', {
    path,
    counts: report.counts,
  });
  return path;
}
