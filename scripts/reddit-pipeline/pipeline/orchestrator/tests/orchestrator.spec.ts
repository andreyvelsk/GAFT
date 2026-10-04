import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateResult } from '../../../agents/create';
import type { AppConfig } from '../../../config/lib/types';
import {
  saveImage as realSaveImage,
  type DownloadImageOptions,
  type MediaResult,
} from '../../../content/media';
import type { PageInput } from '../../../content/template';
import { createLogger } from '../../../shared/lib/logger';
import { buildPricingTable, emptyPricingTable } from '../../../shared/lib/pricing';
import type { Logger, RawPost, ReportEntry } from '../../../shared/lib/types';
import type { CreateStageResult } from '../../stages/create';
import type { FetchStageResult } from '../../stages/fetch';
import type { FilterStageResult } from '../../stages/filter';
import type { MatchStageResult } from '../../stages/match';
import { runPipeline, type OrchestratorDependencies } from '../index';

/** Mock of the category agent module (hoisted so `vi.mock` can use it). */
const categoryMock = vi.hoisted(() => ({
  createCategoryAgent: vi.fn(),
  classifyCategory: vi.fn(),
}));

vi.mock('../../../../agents/category', () => ({
  createCategoryAgent: categoryMock.createCategoryAgent,
}));

/** Whether the media integration tests should run. */
const RUN_INTEGRATION = process.env.RUN_MEDIA_INTEGRATION === 'true';

/** Fixed reference time used to keep the run deterministic. */
const NOW = new Date('2026-01-01T12:00:00.000Z');

/** 1×1 transparent PNG used by the integration test. */
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

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
      prefilter: true,
      ...overrides,
    },
    pr: { branch: 'reddit-pipeline/auto', base: 'main', labels: [] },
    github: { token: '' },
  };
}

/** Build a report entry with sensible defaults plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'a',
    title: 'Post A',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/a/',
    selftext: '',
    external_url: 'https://github.com/me/app',
    flair: '',
    images: [],
    ...overrides,
  };
}

/** Build a raw post that passes the deterministic prefilter. */
function rawPost(id: string): RawPost {
  return {
    id,
    title: `I built a dual screen app ${id}`,
    author: 'someone',
    created_utc: 1700000000,
    permalink: `/r/AynThor/comments/${id}/`,
    selftext: 'Check it out https://github.com/me/app',
    url: 'https://github.com/me/app',
  };
}

/** A logger that discards its output. */
function silentLogger(): Logger {
  return createLogger({ write: (): void => undefined });
}

/** Build a validated page input for the given slug. */
function makePage(slug: string): PageInput {
  return {
    frontmatter: {
      title: 'Pixel Navigator',
      description: 'Android map companion.',
      date: '2026-01-01 00:00',
      slug,
      category: 'app',
      media: [{ type: 'image', url: `/content/${slug}/preview.webp` }],
    },
    sections: {
      sourceUrl: 'https://www.reddit.com/r/AynThor/comments/a/',
      sections: [
        { heading: 'Description', body: 'Body.' },
        { heading: 'Setup guide', body: 'Install.' },
      ],
      projectUrl: 'https://github.com/me/app',
    },
  };
}

/** Build a create result for the given slug. */
function makeCreateResult(slug: string): CreateResult {
  return {
    slug,
    draft: {
      title: 'Pixel Navigator',
      description: 'Android map companion.',
      category: 'app',
      slug,
      sections: [
        { heading: 'Description', body: 'Body.' },
        { heading: 'Setup guide', body: 'Install.' },
      ],
      media: [],
    },
    context: { repo: null, readme: null, release: null },
    page: makePage(slug),
    markdown: '---\ntitle: "Pixel Navigator"\n---\n\n## Description\n\nBody.\n',
    media: [{ url: 'https://i.redd.it/a.jpg', fileName: 'preview.webp' }],
  };
}

/** Build injected stages that never touch the network. */
function makeDeps(
  entries: readonly ReportEntry[],
  relevantIds: readonly string[],
): OrchestratorDependencies {
  return {
    fetchStage: () =>
      Promise.resolve({
        window: { subreddit: 'AynThor', after: 0, before: 0 },
        fetched: entries.length,
        entries: [...entries],
        dropped: [],
      }),
    filterStage: (input) =>
      Promise.resolve({
        relevant: input.filter((entry) => relevantIds.includes(entry.id)),
        skipped: input
          .filter((entry) => !relevantIds.includes(entry.id))
          .map((entry) => ({ entry, reason: 'not relevant' })),
      }),
    matchStage: (input) =>
      Promise.resolve({
        decisions: input.map((entry) => ({
          entry,
          decision: { action: 'CREATE', slug: entry.id },
        })),
      }),
    createStage: (entry) =>
      Promise.resolve({
        slug: entry.id,
        markdown: 'md',
        media: [],
        written: true,
      }),
    updateStage: (_entry, slug) =>
      Promise.resolve({
        slug,
        markdown: 'md',
        media: [],
        changed: [],
        written: true,
      }),
  };
}

describe('runPipeline', () => {
  let dir: string | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    categoryMock.createCategoryAgent.mockReturnValue({
      classifyCategory: categoryMock.classifyCategory,
    });
    categoryMock.classifyCategory.mockResolvedValue('app');
  });

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('runs the full pipeline in dry-run mode without writing content files', async () => {
    dir = await mkdtemp(join(tmpdir(), 'orchestrator-'));
    const contentDir = join(dir, 'content');
    const publicContentDir = join(dir, 'public');
    const reportPath = join(dir, 'report.json');
    const entries = [makeEntry({ id: 'a' })];

    const result = await runPipeline({
      config: makeConfig({ dryRun: true }),
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      reportPath,
      deps: makeDeps(entries, ['a']),
      stages: {
        create: {
          create: () => Promise.resolve(makeCreateResult('a')),
          contentDir,
          publicContentDir,
        },
      },
    });

    expect(result.report.dryRun).toBe(true);
    expect(result.report.counts).toEqual({
      total: 1,
      created: 1,
      updated: 0,
      skipped: 0,
      errors: 0,
    });
    expect(result.reportPath).toBe(reportPath);
    const raw = await readFile(reportPath, 'utf8');
    expect(raw).toContain('"created": 1');
    // The report reason is synthesized from the decision, not taken from it.
    expect(result.report.posts[0]?.reason).toBe('match: CREATE a');
    expect(raw).toContain('match: CREATE a');
  });

  it('does not invoke the category agent when a create stage is injected', async () => {
    const entries = [makeEntry({ id: 'a' })];

    await runPipeline({
      config: makeConfig(),
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      writeReport: false,
      deps: makeDeps(entries, ['a']),
    });

    expect(categoryMock.createCategoryAgent).not.toHaveBeenCalled();
  });

  it('processes exactly one post when maxPosts is 1', async () => {
    const { fetchStage: _fetchStage, ...deps } = makeDeps([], []);
    const result = await runPipeline({
      config: makeConfig({ maxPosts: 1 }),
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      writeReport: false,
      deps,
      stages: {
        fetch: {
          fetchPosts: () =>
            Promise.resolve([rawPost('one'), rawPost('two'), rawPost('three')]),
        },
      },
    });

    expect(result.report.counts.total).toBe(1);
    expect(result.report.posts).toHaveLength(1);
  });

  it('records an agent failure on one post and keeps processing the rest', async () => {
    const entries = [
      makeEntry({ id: 'a' }),
      makeEntry({ id: 'b' }),
      makeEntry({ id: 'c' }),
    ];
    const deps = makeDeps(entries, ['a', 'b', 'c']);
    deps.matchStage = (input): Promise<MatchStageResult> => {
      if (input.some((entry) => entry.id === 'b')) {
        return Promise.reject(new Error('agent failed'));
      }
      return Promise.resolve({
        decisions: input.map((entry) => ({
          entry,
          decision: { action: 'CREATE', slug: entry.id },
        })),
      });
    };

    const result = await runPipeline({
      config: makeConfig(),
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      writeReport: false,
      deps,
    });

    expect(result.report.counts.created).toBe(2);
    expect(result.report.counts.errors).toBe(1);
    const failed = result.report.posts.find((post) => post.id === 'b');
    expect(failed?.action).toBe('error');
    expect(failed?.error).toBe('agent failed');
  });

  it('keeps only the latest post per slug and skips the duplicate slugs', async () => {
    const entries = [
      makeEntry({ id: 'a', created_utc: 1700000000 }),
      makeEntry({ id: 'b', created_utc: 1700000200 }),
      makeEntry({ id: 'c', created_utc: 1700000100 }),
    ];
    const deps = makeDeps(entries, ['a', 'b', 'c']);
    deps.matchStage = (input): Promise<MatchStageResult> =>
      Promise.resolve({
        decisions: input.map((entry) => ({
          entry,
          decision: { action: 'CREATE', slug: 'simple-trackpad' },
        })),
      });

    const result = await runPipeline({
      config: makeConfig(),
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      writeReport: false,
      deps,
    });

    expect(result.report.counts.created).toBe(1);
    expect(result.report.counts.skipped).toBe(2);
    const created = result.report.posts.find(
      (post) => post.action === 'created',
    );
    expect(created?.id).toBe('b');
    const skipped = result.report.posts.filter(
      (post) => post.action === 'skipped',
    );
    expect(skipped.map((post) => post.id).sort()).toEqual(['a', 'c']);
  });

  it('aggregates per-agent usage and estimates the LLM cost', async () => {
    const entries = [makeEntry({ id: 'a' })];
    const deps = makeDeps(entries, ['a']);
    deps.filterStage = (input, options): Promise<FilterStageResult> => {
      options.filterOptions?.onUsage?.({ inputTokens: 1000, outputTokens: 500 });
      return Promise.resolve({ relevant: [...input], skipped: [] });
    };
    deps.createStage = (entry, options): Promise<CreateStageResult> => {
      options.createOptions?.onUsage?.({ inputTokens: 2000, outputTokens: 1000 });
      return Promise.resolve({
        slug: entry.id,
        markdown: 'md',
        media: [],
        written: true,
      });
    };

    const result = await runPipeline({
      config: makeConfig(),
      now: NOW,
      logger: silentLogger(),
      pricing: buildPricingTable({
        data: [
          {
            id: 'test/model',
            pricing: { prompt: '0.000001', completion: '0.000002' },
          },
        ],
      }),
      writeReport: false,
      deps,
    });

    const filter = result.report.usage.byAgent.find(
      (entry) => entry.agent === 'filter',
    );
    const create = result.report.usage.byAgent.find(
      (entry) => entry.agent === 'create',
    );
    expect(filter).toMatchObject({
      agent: 'filter',
      model: 'test/model',
      backend: 'llm',
      calls: 1,
      inputTokens: 1000,
      outputTokens: 500,
    });
    // 1000/1e6*1 + 500/1e6*2 = 0.002
    expect(filter?.cost).toBeCloseTo(0.002, 10);
    // 2000/1e6*1 + 1000/1e6*2 = 0.004
    expect(create?.cost).toBeCloseTo(0.004, 10);
    expect(result.report.usage.total.calls).toBe(2);
    expect(result.report.usage.total.cost).toBeCloseTo(0.006, 10);
  });

  it('forwards the configured backend to the filter stage and reports the Jev model', async () => {
    const entries = [makeEntry({ id: 'a' })];
    const deps = makeDeps(entries, ['a']);
    let receivedBackend: string | undefined;
    deps.filterStage = (input, options): Promise<FilterStageResult> => {
      receivedBackend = options.backend;
      options.filterOptions?.onUsage?.({
        inputTokens: 10,
        outputTokens: 5,
        cost: 0.001,
      });
      return Promise.resolve({ relevant: [...input], skipped: [] });
    };

    const config = makeConfig();
    config.backends = { filter: 'jev', match: 'jev', category: 'jev' };

    const result = await runPipeline({
      config,
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      writeReport: false,
      deps,
    });

    expect(receivedBackend).toBe('jev');
    const filter = result.report.usage.byAgent.find(
      (entry) => entry.agent === 'filter',
    );
    expect(filter).toMatchObject({
      agent: 'filter',
      backend: 'jev',
      model: 'test/jev',
      calls: 1,
      cost: 0.001,
    });
  });

  it('propagates a fatal fetch error', async () => {
    const deps = makeDeps([], []);
    deps.fetchStage = (): Promise<FetchStageResult> =>
      Promise.reject(new Error('config broken'));

    await expect(
      runPipeline({
        config: makeConfig(),
        now: NOW,
        logger: silentLogger(),
        pricing: emptyPricingTable(),
        writeReport: false,
        deps,
      }),
    ).rejects.toThrow('config broken');
  });
});

describe.skipIf(!RUN_INTEGRATION)('runPipeline (integration)', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('writes real index.md and media files to a temp directory', async () => {
    dir = await mkdtemp(join(tmpdir(), 'orchestrator-int-'));
    const contentDir = join(dir, 'content');
    const publicContentDir = join(dir, 'public');
    const png = Buffer.from(PNG_BASE64, 'base64');
    const saveImage = (options: DownloadImageOptions): Promise<MediaResult> =>
      realSaveImage({
        ...options,
        fetchImpl: () => Promise.resolve(new Response(png, { status: 200 })),
      });
    const entries = [makeEntry({ id: 'a' })];
    const { createStage: _createStage, ...deps } = makeDeps(entries, ['a']);

    const result = await runPipeline({
      config: makeConfig(),
      now: NOW,
      logger: silentLogger(),
      pricing: emptyPricingTable(),
      writeReport: false,
      deps,
      stages: {
        create: {
          create: () => Promise.resolve(makeCreateResult('a')),
          contentDir,
          publicContentDir,
          saveImage,
        },
      },
    });

    expect(result.report.counts.created).toBe(1);
    const markdown = await readFile(
      join(contentDir, 'a', 'index.md'),
      'utf8',
    );
    expect(markdown).toContain('## Description');
    const webp = await readFile(
      join(publicContentDir, 'a', 'preview.webp'),
    );
    expect(webp.subarray(0, 4).toString('ascii')).toBe('RIFF');
  });
});
