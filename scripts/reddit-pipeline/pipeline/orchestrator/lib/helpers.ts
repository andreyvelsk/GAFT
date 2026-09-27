import { loadConfig } from '../../../config';
import { createLogger } from '../../../shared/lib/logger';
import type { ReportEntry } from '../../../shared/lib/types';
import {
  createReportBuilder,
  writeReport,
  type PostAction,
  type PostReportEntry,
} from '../../report';
import { runCreateStage } from '../../stages/create';
import { runFetchStage } from '../../stages/fetch';
import { runFilterStage } from '../../stages/filter';
import { runMatchStage } from '../../stages/match';
import { runUpdateStage } from '../../stages/update';
import type { OrchestratorOptions, OrchestratorResult } from './types';

/** Human-readable message of an unknown error. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Build a per-post report entry, omitting the optional fields when absent. */
function postEntry(
  entry: ReportEntry,
  action: PostAction,
  reason: string,
  extra: { slug?: string; error?: string } = {},
): PostReportEntry {
  return {
    id: entry.id,
    permalink: entry.permalink,
    title: entry.title,
    action,
    reason,
    ...(extra.slug !== undefined ? { slug: extra.slug } : {}),
    ...(extra.error !== undefined ? { error: extra.error } : {}),
  };
}

/**
 * Run the full pipeline: fetch → prefilter → filter → match → create/update,
 * then build and write the run report.
 *
 * A failure while processing a single post is recorded in the report and does
 * not abort the run; only a fatal error (e.g. an invalid configuration) throws.
 */
export async function runPipeline(
  options: OrchestratorOptions = {},
): Promise<OrchestratorResult> {
  const cfg = options.config ?? loadConfig();
  const logger = options.logger ?? createLogger();
  const fixedNow = options.now;
  const clock = (): Date => fixedNow ?? new Date();
  const windowNow = fixedNow ?? new Date();
  const dryRun = cfg.reddit.dryRun;

  const deps = options.deps ?? {};
  const stages = options.stages ?? {};

  const fetchStage = deps.fetchStage ?? runFetchStage;
  const filterStage = deps.filterStage ?? runFilterStage;
  const matchStage = deps.matchStage ?? runMatchStage;
  const createStage = deps.createStage ?? runCreateStage;
  const updateStage = deps.updateStage ?? runUpdateStage;

  const builder = createReportBuilder({ dryRun, now: clock });

  logger.info('pipeline started', {
    subreddit: cfg.reddit.subreddit,
    lookbackHours: cfg.reddit.lookbackHours,
    maxPosts: cfg.reddit.maxPosts,
    dryRun,
  });

  const fetchResult = await fetchStage({
    subreddit: cfg.reddit.subreddit,
    lookbackHours: cfg.reddit.lookbackHours,
    maxPosts: cfg.reddit.maxPosts,
    now: windowNow,
    ...stages.fetch,
  });

  for (const dropped of fetchResult.dropped) {
    builder.add(
      postEntry(dropped.entry, 'skipped', `prefilter: ${dropped.reason}`),
    );
  }

  const filterResult = await filterStage(fetchResult.entries, {
    batchSize: cfg.reddit.batchSize,
    ...stages.filter,
  });

  for (const skipped of filterResult.skipped) {
    builder.add(
      postEntry(skipped.entry, 'skipped', `filter: ${skipped.reason}`),
    );
  }

  for (const entry of filterResult.relevant) {
    try {
      const matchResult = await matchStage([entry], stages.match ?? {});
      const matched = matchResult.decisions[0];
      if (matched === undefined) {
        throw new Error('match stage returned no decision');
      }
      const { decision } = matched;

      if (decision.action === 'CREATE') {
        const created = await createStage(entry, {
          ...stages.create,
          dryRun,
        });
        builder.add(
          postEntry(entry, 'created', decision.reason, { slug: created.slug }),
        );
      } else {
        const updated = await updateStage(entry, decision.slug, {
          ...stages.update,
          dryRun,
        });
        builder.add(
          postEntry(entry, 'updated', decision.reason, { slug: updated.slug }),
        );
      }
    } catch (error) {
      const message = errorMessage(error);
      logger.error('post processing failed', { id: entry.id, error: message });
      builder.add(
        postEntry(entry, 'error', 'processing failed', { error: message }),
      );
    }
  }

  const report = builder.build();

  let reportPath: string | null = null;
  if (options.writeReport !== false) {
    reportPath = await writeReport(report, {
      ...(options.reportPath !== undefined
        ? { reportPath: options.reportPath }
        : {}),
      logger,
    });
  }

  logger.info('pipeline finished', { counts: report.counts });
  return { report, reportPath };
}
