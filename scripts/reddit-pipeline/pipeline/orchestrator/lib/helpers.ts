import { loadConfig } from '../../../config';
import type {
  AgentBackendConfig,
  AgentModelsConfig,
  AppConfig,
} from '../../../config/lib/types';
import type { DecisionBackend } from '../../../engines/decision';
import type { AgentName } from '../../../engines/model';
import { createLogger } from '../../../shared/lib/logger';
import {
  estimateCost,
  loadPricing,
  type PricingTable,
} from '../../../shared/lib/pricing';
import type {
  Logger,
  ModelUsage,
  ReportEntry,
} from '../../../shared/lib/types';
import {
  createUsageTracker,
  emptyUsage,
  mergeUsage,
} from '../../../shared/lib/usage';
import {
  createReportBuilder,
  markdownPathFor,
  writeReport,
  writeReportMarkdown,
  type AgentUsage,
  type PostAction,
  type PostReportEntry,
  type ReportBuilder,
  type RunUsage,
} from '../../report';
import {
  loadReviewLedger,
  markReviewApproved,
  markReviewFailed,
  mergeReviewPosts,
  saveReviewLedger,
  type ReviewCandidate,
} from '../../review';
import {
  runCreateStage,
  type CreateStageOptions,
  type CreateStageResult,
} from '../../stages/create';
import { runFetchStage, type FetchStageOptions } from '../../stages/fetch';
import { runFilterStage } from '../../stages/filter';
import {
  runMatchStage,
  type MatchedPost,
  type MatchStageOptions,
  type MatchStageResult,
} from '../../stages/match';
import {
  runUpdateStage,
  type UpdateStageOptions,
  type UpdateStageResult,
} from '../../stages/update';
import type {
  OrchestratorOptions,
  OrchestratorResult,
  OrchestratorStageOptions,
} from './types';

/** Human-readable message of an unknown error. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Stable order of the agents in the usage report. */
const AGENT_ORDER: readonly AgentName[] = [
  'filter',
  'match',
  'category',
  'create',
  'update',
];

/** Resolve the configured model of an agent (type-safe lookup). */
function modelForAgent(
  models: AgentModelsConfig,
  agent: string,
): string | undefined {
  switch (agent) {
    case 'filter':
      return models.filter;
    case 'match':
      return models.match;
    case 'create':
      return models.create;
    case 'update':
      return models.update;
    case 'category':
      return models.category;
    default:
      return undefined;
  }
}

/** Resolve the decision backend of an agent (only the decision agents have one). */
function backendForAgent(
  backends: AgentBackendConfig,
  agent: AgentName,
): DecisionBackend | undefined {
  switch (agent) {
    case 'filter':
      return backends.filter;
    case 'match':
      return backends.match;
    case 'category':
      return backends.category;
    case 'create':
    case 'update':
      return undefined;
  }
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

/** Normalize report entries into review-ledger candidates. */
function toReviewCandidates(
  entries: readonly ReportEntry[],
): ReviewCandidate[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    permalink: entry.permalink,
    createdUtc: entry.created_utc,
  }));
}

/** Outcome of processing a single post, used to update the review ledger. */
interface ProcessedOutcome {
  /** Reddit post id. */
  id: string;

  /** What the pipeline did with the post. */
  action: PostAction;

  /** Page slug (present for created/updated posts). */
  slug?: string;

  /** Error message (present for failed/skipped posts). */
  error?: string;
}

/** Dependencies of {@link processRelevantPosts}. */
interface ProcessRelevantOptions {
  /** Posts to process. */
  entries: readonly ReportEntry[];

  /** Resolved configuration. */
  cfg: AppConfig;

  /** Structured logger. */
  logger: Logger;

  /** Whether the run is a dry run. */
  dryRun: boolean;

  /** Per-stage option overrides. */
  stages: OrchestratorStageOptions;

  /** Report builder receiving the per-post entries. */
  builder: ReportBuilder;

  /** Match stage implementation. */
  matchStage: (
    entries: readonly ReportEntry[],
    options: MatchStageOptions,
  ) => Promise<MatchStageResult>;

  /** Create stage implementation. */
  createStage: (
    entry: ReportEntry,
    options: CreateStageOptions,
  ) => Promise<CreateStageResult>;

  /** Update stage implementation. */
  updateStage: (
    entry: ReportEntry,
    slug: string,
    options: UpdateStageOptions,
  ) => Promise<UpdateStageResult>;

  /** Record a model call for the usage report. */
  onUsage: (agent: AgentName, usage: ModelUsage) => void;
}

/**
 * Process the relevant posts: `match → category → create/update`, recording the
 * outcome of every post in the report. Returns the per-post outcomes so the
 * caller can update the review ledger in approve mode.
 *
 * A failure on a single post is isolated and does not abort the run; posts that
 * resolve to the same slug keep only the latest one per run.
 */
async function processRelevantPosts(
  options: ProcessRelevantOptions,
): Promise<ProcessedOutcome[]> {
  const {
    entries,
    cfg,
    logger,
    dryRun,
    stages,
    builder,
    matchStage,
    createStage,
    updateStage,
    onUsage,
  } = options;
  const outcomes: ProcessedOutcome[] = [];

  logger.info('stage process: processing relevant posts', {
    count: entries.length,
  });

  // Phase 1: match every post. The match stage is per-post so a failure on one
  // post is isolated and does not abort the run.
  const matchedEntries: MatchedPost[] = [];
  for (const [index, entry] of entries.entries()) {
    logger.info('post: matching', {
      index: index + 1,
      total: entries.length,
      id: entry.id,
      title: entry.title,
    });
    try {
      const matchResult = await matchStage([entry], {
        backend: cfg.backends.match,
        threshold: cfg.thresholds.match,
        logger,
        ...stages.match,
        matchOptions: {
          ...stages.match?.matchOptions,
          onUsage: (reported): void => {
            onUsage('match', reported);
          },
        },
      });
      const matched = matchResult.decisions[0];
      if (matched === undefined) {
        throw new Error('match stage returned no decision');
      }
      matchedEntries.push(matched);
    } catch (error) {
      const message = errorMessage(error);
      logger.error('post matching failed', { id: entry.id, error: message });
      builder.add(
        postEntry(entry, 'error', 'processing failed', { error: message }),
      );
      outcomes.push({ id: entry.id, action: 'error', error: message });
    }
  }

  // Phase 2: several posts of a single run can resolve to the same page slug
  // (e.g. cross-posts or reposts of the same project). Keep only the latest
  // post per slug and skip the rest, so a page is never created/updated twice
  // within one run.
  const latestBySlug = new Map<string, MatchedPost>();
  for (const matched of matchedEntries) {
    const current = latestBySlug.get(matched.decision.slug);
    if (
      current === undefined ||
      matched.entry.created_utc > current.entry.created_utc
    ) {
      latestBySlug.set(matched.decision.slug, matched);
    }
  }
  const kept = new Set<MatchedPost>(latestBySlug.values());

  // Phase 3: create/update the kept posts and skip the duplicate slugs.
  for (const matched of matchedEntries) {
    const { entry, decision } = matched;
    if (!kept.has(matched)) {
      const keeper = latestBySlug.get(decision.slug);
      logger.info('post: skipped duplicate slug', {
        id: entry.id,
        slug: decision.slug,
        keptId: keeper?.entry.id,
      });
      builder.add(
        postEntry(
          entry,
          'skipped',
          `duplicate slug: ${decision.slug} (kept latest post ${keeper?.entry.id ?? ''})`,
        ),
      );
      outcomes.push({
        id: entry.id,
        action: 'skipped',
        error: `duplicate slug: ${decision.slug}`,
      });
      continue;
    }

    const matchReason = `match: ${decision.action} ${decision.slug}`;
    logger.info('stage match: decided', {
      id: entry.id,
      action: decision.action,
      slug: decision.slug,
    });

    try {
      if (decision.action === 'CREATE') {
        const created = await createStage(entry, {
          ...stages.create,
          dryRun,
          createOptions: {
            ...stages.create?.createOptions,
            onUsage: (reported): void => {
              onUsage('create', reported);
            },
            logger,
          },
          categoryOptions: {
            backend: cfg.backends.category,
            threshold: cfg.thresholds.category,
            ...stages.create?.categoryOptions,
            onUsage: (reported): void => {
              onUsage('category', reported);
            },
          },
          onWrite: (info): void => {
            logger.info('stage create: writing page', { path: info.path });
          },
          onMedia: (info): void => {
            logger.info('stage create: downloading media', info);
          },
          onMediaError: (info): void => {
            logger.warn('stage create: media download failed', info);
          },
        });
        logger.info('stage create: done', {
          slug: created.slug,
          written: created.written,
        });
        builder.add(
          postEntry(entry, 'created', matchReason, { slug: created.slug }),
        );
        outcomes.push({
          id: entry.id,
          action: 'created',
          slug: created.slug,
        });
      } else {
        const updated = await updateStage(entry, decision.slug, {
          ...stages.update,
          dryRun,
          updateOptions: {
            ...stages.update?.updateOptions,
            onUsage: (reported): void => {
              onUsage('update', reported);
            },
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
          onMediaError: (info): void => {
            logger.warn('stage update: media download failed', info);
          },
        });
        logger.info('stage update: done', {
          slug: updated.slug,
          written: updated.written,
        });
        builder.add(
          postEntry(entry, 'updated', matchReason, { slug: updated.slug }),
        );
        outcomes.push({
          id: entry.id,
          action: 'updated',
          slug: updated.slug,
        });
      }
    } catch (error) {
      const message = errorMessage(error);
      logger.error('post processing failed', { id: entry.id, error: message });
      builder.add(
        postEntry(entry, 'error', 'processing failed', { error: message }),
      );
      outcomes.push({ id: entry.id, action: 'error', error: message });
    }
  }

  return outcomes;
}

/**
 * Run the pipeline according to `config.reddit.mode`:
 *
 * - `review` — `fetch → prefilter → filter`, record the relevant posts into the
 *   review ledger and stop (no `match`/`create`/`update`);
 * - `full` — the full `fetch → filter → match → create/update` cycle;
 * - `approve` — fetch the listed post ids (no prefilter/filter), run
 *   `match → category → create/update` and mark the ledger.
 *
 * Then build and write the run report. A failure while processing a single post
 * is recorded in the report and does not abort the run; only a fatal error
 * (e.g. an invalid configuration) throws.
 */
export async function runPipeline(
  options: OrchestratorOptions = {},
): Promise<OrchestratorResult> {
  const startedAtMs = Date.now();
  const cfg = options.config ?? loadConfig();
  const mode = cfg.reddit.mode;
  const logger = options.logger ?? createLogger();
  const fixedNow = options.now;
  const clock = (): Date => fixedNow ?? new Date();
  const windowNow = fixedNow ?? new Date();
  const dryRun = cfg.reddit.dryRun;

  const deps = options.deps ?? {};
  const stages = options.stages ?? {};

  const pricing: PricingTable =
    options.pricing ?? (await loadPricing({ logger }));
  const tracker = createUsageTracker({
    costOf: (agent, usage): number => {
      const model = modelForAgent(cfg.models, agent);
      return model === undefined ? 0 : estimateCost(pricing.get(model), usage);
    },
  });
  const usage = (): RunUsage => {
    const totals = tracker.totals();
    const byAgent: AgentUsage[] = [];
    let total = emptyUsage();
    for (const agent of AGENT_ORDER) {
      const agentTotals = totals[agent];
      if (agentTotals === undefined) {
        continue;
      }
      const backend = backendForAgent(cfg.backends, agent);
      // The Jev backend answers with the System One model, not the OpenRouter
      // model configured for the LLM backend, so report the model actually used.
      const model =
        backend === 'jev'
          ? cfg.decisions.model
          : modelForAgent(cfg.models, agent) ?? '';
      byAgent.push({
        agent,
        model,
        ...(backend !== undefined ? { backend } : {}),
        ...agentTotals,
      });
      total = mergeUsage(total, agentTotals);
    }
    return { byAgent, total };
  };

  const fetchStage = deps.fetchStage ?? runFetchStage;
  const filterStage = deps.filterStage ?? runFilterStage;
  const matchStage = deps.matchStage ?? runMatchStage;
  const createStage = deps.createStage ?? runCreateStage;
  const updateStage = deps.updateStage ?? runUpdateStage;

  const builder = createReportBuilder({ dryRun, now: clock, usage });

  logger.info('pipeline started', {
    subreddit: cfg.reddit.subreddit,
    lookbackHours: cfg.reddit.lookbackHours,
    maxPosts: cfg.reddit.maxPosts,
    dryRun,
    mode,
  });

  const approve = mode === 'approve';
  const fetchOptions: FetchStageOptions = {
    subreddit: cfg.reddit.subreddit,
    lookbackHours: cfg.reddit.lookbackHours,
    maxPosts: cfg.reddit.maxPosts,
    prefilter: cfg.reddit.prefilter,
    now: windowNow,
    ...stages.fetch,
  };
  if (approve) {
    // Approve mode fetches only the approved ids and never applies the
    // prefilter (the human already decided these posts are relevant).
    fetchOptions.prefilter = false;
    fetchOptions.postIds = options.approvePostIds ?? [];
  }

  logger.info('stage fetch: fetching posts from reddit', {
    mode,
    ...(approve ? { postIds: fetchOptions.postIds?.length ?? 0 } : {}),
  });
  const fetchResult = await fetchStage(fetchOptions);
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

  for (const error of fetchResult.errors ?? []) {
    logger.error('fetch: post unavailable', {
      id: error.id,
      error: error.message,
    });
    builder.add({
      id: error.id,
      permalink: `https://www.reddit.com/comments/${error.id}`,
      title: error.id,
      action: 'error',
      reason: 'approve: fetch failed',
      error: error.message,
    });
  }

  const relevant: ReportEntry[] = [];
  if (approve) {
    relevant.push(...fetchResult.entries);
    logger.info('stage filter: skipped', {
      mode,
      posts: relevant.length,
    });
  } else {
    const filterEntries = fetchResult.entries;
    logger.info('stage filter: classifying relevance', {
      posts: filterEntries.length,
      batchSize: cfg.reddit.batchSize,
    });
    const filterResult = await filterStage(filterEntries, {
      batchSize: cfg.reddit.batchSize,
      backend: cfg.backends.filter,
      threshold: cfg.thresholds.filter,
      logger,
      ...stages.filter,
      filterOptions: {
        ...stages.filter?.filterOptions,
        onUsage: (reported): void => {
          tracker.record('filter', reported);
        },
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

    relevant.push(...filterResult.relevant);
  }

  if (mode === 'review') {
    // Review mode stops here: record the relevant posts into the ledger and do
    // not run match/category/create/update.
    for (const entry of relevant) {
      logger.info('review: awaiting approval', {
        id: entry.id,
        title: entry.title,
      });
      builder.add(postEntry(entry, 'relevant', 'awaiting approval'));
    }
    const ledger = mergeReviewPosts(
      await loadReviewLedger({ path: options.reviewPath }),
      toReviewCandidates(relevant),
      { now: clock },
    );
    await saveReviewLedger(ledger, {
      path: options.reviewPath,
      markdownPath: options.reviewMarkdownPath,
      logger,
    });
    logger.info('review: ledger updated', {
      pending: ledger.posts.filter((post) => post.status === 'pending').length,
    });
  } else {
    const outcomes = await processRelevantPosts({
      entries: relevant,
      cfg,
      logger,
      dryRun,
      stages,
      builder,
      matchStage,
      createStage,
      updateStage,
      onUsage: (agent, reported): void => {
        tracker.record(agent, reported);
      },
    });

    if (approve) {
      // Upsert the fetched posts first so an approved id that was not in the
      // ledger yet still gets an entry, then record the outcome.
      let ledger = mergeReviewPosts(
        await loadReviewLedger({ path: options.reviewPath }),
        toReviewCandidates(relevant),
        { now: clock },
      );
      for (const error of fetchResult.errors ?? []) {
        ledger = markReviewFailed(ledger, error.id, error.message);
      }
      for (const outcome of outcomes) {
        if (
          (outcome.action === 'created' || outcome.action === 'updated') &&
          outcome.slug !== undefined
        ) {
          ledger = markReviewApproved(ledger, outcome.id, outcome.slug, {
            now: clock,
          });
        } else {
          ledger = markReviewFailed(
            ledger,
            outcome.id,
            outcome.error ?? 'not processed',
          );
        }
      }
      await saveReviewLedger(ledger, {
        path: options.reviewPath,
        markdownPath: options.reviewMarkdownPath,
        logger,
      });
      logger.info('approve: ledger updated', {
        approved: ledger.posts.filter((post) => post.status === 'approved')
          .length,
        pending: ledger.posts.filter((post) => post.status === 'pending')
          .length,
      });
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
