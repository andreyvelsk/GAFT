import { loadConfig } from '../../../config';
import { createLogger } from '../../../shared/lib/logger';
import type { ReportEntry } from '../../../shared/lib/types';
import {
  createReportBuilder,
  markdownPathFor,
  writeReport,
  writeReportMarkdown,
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
  const startedAtMs = Date.now();
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

  logger.info('stage fetch: fetching posts from reddit');
  const fetchResult = await fetchStage({
    subreddit: cfg.reddit.subreddit,
    lookbackHours: cfg.reddit.lookbackHours,
    maxPosts: cfg.reddit.maxPosts,
    now: windowNow,
    ...stages.fetch,
  });
  logger.info('stage fetch: done', {
    fetched: fetchResult.fetched,
    kept: fetchResult.entries.length,
    dropped: fetchResult.dropped.length,
  });

  for (const dropped of fetchResult.dropped) {
    logger.info('prefilter: dropped', {
      id: dropped.entry.id,
      title: dropped.entry.title,
      reason: dropped.reason,
    });
    builder.add(
      postEntry(dropped.entry, 'skipped', `prefilter: ${dropped.reason}`),
    );
  }

  const filterEntries = fetchResult.entries;
  logger.info('stage filter: classifying relevance', {
    posts: filterEntries.length,
    batchSize: cfg.reddit.batchSize,
  });
  const filterResult = await filterStage(filterEntries, {
    batchSize: cfg.reddit.batchSize,
    ...stages.filter,
    filterOptions: {
      ...stages.filter?.filterOptions,
      onBatch: (info): void => {
        logger.info('stage filter: batch classified', {
          batch: info.batch,
          totalBatches: info.totalBatches,
          posts: info.posts,
        });
      },
    },
  });
  logger.info('stage filter: done', {
    relevant: filterResult.relevant.length,
    skipped: filterResult.skipped.length,
  });

  for (const skipped of filterResult.skipped) {
    logger.info('filter: not relevant', {
      id: skipped.entry.id,
      title: skipped.entry.title,
    });
    builder.add(
      postEntry(skipped.entry, 'skipped', `filter: ${skipped.reason}`),
    );
  }

  const relevant = filterResult.relevant;
  logger.info('stage process: processing relevant posts', {
    count: relevant.length,
  });

  for (const [index, entry] of relevant.entries()) {
    logger.info('post: processing', {
      index: index + 1,
      total: relevant.length,
      id: entry.id,
      title: entry.title,
    });
    try {
      const matchResult = await matchStage([entry], stages.match ?? {});
      const matched = matchResult.decisions[0];
      if (matched === undefined) {
        throw new Error('match stage returned no decision');
      }
      const { decision } = matched;
      logger.info('stage match: decided', {
        id: entry.id,
        action: decision.action,
        slug: decision.slug,
        reason: decision.reason,
      });

      if (decision.action === 'CREATE') {
        const created = await createStage(entry, {
          ...stages.create,
          dryRun,
          createOptions: {
            ...stages.create?.createOptions,
            logger,
          },
          onWrite: (info): void => {
            logger.info('stage create: writing page', { path: info.path });
          },
          onMedia: (info): void => {
            logger.info('stage create: downloading media', info);
          },
        });
        logger.info('stage create: done', {
          slug: created.slug,
          written: created.written,
        });
        builder.add(
          postEntry(entry, 'created', decision.reason, { slug: created.slug }),
        );
      } else {
        const updated = await updateStage(entry, decision.slug, {
          ...stages.update,
          dryRun,
          updateOptions: {
            ...stages.update?.updateOptions,
            logger,
          },
          onWrite: (info): void => {
            logger.info('stage update: writing page', {
              slug: decision.slug,
              path: info.path,
            });
          },
          onMedia: (info): void => {
            logger.info('stage update: downloading media', info);
          },
        });
        logger.info('stage update: done', {
          slug: updated.slug,
          written: updated.written,
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
    await writeReportMarkdown(report, {
      markdownPath: markdownPathFor(reportPath),
      logger,
    });
  }

  logger.info('pipeline finished', {
    counts: report.counts,
    durationMs: Date.now() - startedAtMs,
  });
  return { report, reportPath };
}
