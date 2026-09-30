import {
  REPORT_FILE,
  REPORT_MARKDOWN_FILE,
} from '../../../shared/lib/constants';
import { writeTextFile } from '../../../shared/lib/fs';
import { emptyUsage } from '../../../shared/lib/usage';
import type {
  PostReportEntry,
  ReportBuilder,
  ReportBuilderOptions,
  ReportCounts,
  ReportSummary,
  RunReport,
  RunUsage,
  WriteReportMarkdownOptions,
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
      usage: options.usage?.() ?? { byAgent: [], total: emptyUsage() },
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

/** Derive the Markdown report path from the JSON report path. */
export function markdownPathFor(reportPath: string): string {
  return /\.json$/i.test(reportPath)
    ? reportPath.replace(/\.json$/i, '.md')
    : `${reportPath}.md`;
}

/** Prefix used by the orchestrator for posts dropped by the prefilter. */
const PREFILTER_PREFIX = 'prefilter:';

/** Prefix used by the orchestrator for posts rejected by the filter agent. */
const FILTER_PREFIX = 'filter:';

/**
 * Group the report entries into the categories the summary cares about:
 * prefilter drops, filter rejections, created/updated pages and errors.
 */
export function summarizeReport(report: RunReport): ReportSummary {
  const summary: ReportSummary = {
    prefilter: 0,
    filter: 0,
    otherSkipped: 0,
    created: [],
    updated: [],
    errors: [],
  };

  for (const entry of report.posts) {
    if (entry.action === 'created') {
      summary.created.push(entry);
    } else if (entry.action === 'updated') {
      summary.updated.push(entry);
    } else if (entry.action === 'error') {
      summary.errors.push(entry);
    } else if (entry.reason.startsWith(PREFILTER_PREFIX)) {
      summary.prefilter += 1;
    } else if (entry.reason.startsWith(FILTER_PREFIX)) {
      summary.filter += 1;
    } else {
      summary.otherSkipped += 1;
    }
  }

  return summary;
}

/** Format a USD amount with enough precision for sub-cent costs. */
function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}

/** Format a token count with thousands separators. */
function formatTokens(tokens: number): string {
  return tokens.toLocaleString('en-US');
}

/**
 * Append the per-agent model usage table. Rendered only when at least one agent
 * reported usage, so a run without model calls keeps the report compact.
 */
function appendUsageSection(lines: string[], usage: RunUsage): void {
  if (usage.byAgent.length === 0) {
    return;
  }
  lines.push('### Cost by model');
  lines.push('');
  lines.push(
    '| Agent | Backend | Model | Calls | Input tokens | Output tokens | Cost (USD) |',
  );
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: |');
  for (const entry of usage.byAgent) {
    lines.push(
      `| ${entry.agent} | ${entry.backend ?? '—'} | \`${entry.model}\` | ` +
        `${entry.calls} | ${formatTokens(entry.inputTokens)} | ` +
        `${formatTokens(entry.outputTokens)} | ${formatCost(entry.cost)} |`,
    );
  }
  const total = usage.total;
  lines.push(
    `| **Total** | | | ${total.calls} | ${formatTokens(total.inputTokens)} | ` +
      `${formatTokens(total.outputTokens)} | ${formatCost(total.cost)} |`,
  );
  lines.push('');
}

/** Append a bullet list of report entries under an optional heading. */
function appendEntrySection(
  lines: string[],
  heading: string,
  entries: readonly PostReportEntry[],
): void {
  if (entries.length === 0) {
    return;
  }
  lines.push(`### ${heading} (${entries.length})`);
  lines.push('');
  for (const entry of entries) {
    const slug = entry.slug !== undefined ? ` → \`${entry.slug}\`` : '';
    const error = entry.error !== undefined ? ` — ${entry.error}` : '';
    lines.push(`- ${entry.title}${slug}${error} — [source](${entry.permalink})`);
  }
  lines.push('');
}

/**
 * Render a run report as a human-readable Markdown document. Used for the
 * GitHub Actions job summary and the pull request description.
 */
export function formatReportMarkdown(report: RunReport): string {
  const { counts } = report;
  const summary = summarizeReport(report);
  const lines: string[] = [];

  lines.push('## Reddit pipeline report');
  lines.push('');
  lines.push(
    report.dryRun
      ? '> **Dry run** — no files were written and no pull request was created.'
      : '> Files were written to the working tree.',
  );
  lines.push('');
  lines.push(`- Started: ${report.startedAt}`);
  lines.push(`- Finished: ${report.finishedAt}`);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('| --- | ---: |');
  lines.push(`| Fetched posts | ${counts.total} |`);
  lines.push(`| Dropped by prefilter | ${summary.prefilter} |`);
  lines.push(`| Not relevant (filter agent) | ${summary.filter} |`);
  if (summary.otherSkipped > 0) {
    lines.push(`| Skipped (other) | ${summary.otherSkipped} |`);
  }
  lines.push(`| Created | ${counts.created} |`);
  lines.push(`| Updated | ${counts.updated} |`);
  lines.push(`| Errors | ${counts.errors} |`);
  lines.push('');

  appendUsageSection(lines, report.usage);

  appendEntrySection(lines, 'Created pages', summary.created);
  appendEntrySection(lines, 'Updated pages', summary.updated);
  appendEntrySection(lines, 'Errors', summary.errors);

  return `${lines.join('\n').trimEnd()}\n`;
}

/** Serialize a run report to Markdown and write it to disk. */
export async function writeReportMarkdown(
  report: RunReport,
  options: WriteReportMarkdownOptions = {},
): Promise<string> {
  const path = options.markdownPath ?? REPORT_MARKDOWN_FILE;
  await writeTextFile(path, formatReportMarkdown(report));
  options.logger?.info('run report (markdown) written', { path });
  return path;
}
