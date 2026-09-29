import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CategoryAgentOptions } from '../../../../agents/category';
import type { CreateOptions, CreateResult } from '../../../../agents/create';
import {
  saveImage as realSaveImage,
  type DownloadImageOptions,
  type MediaResult,
} from '../../../../content/media';
import type { PageInput } from '../../../../content/template';
import { createLogger } from '../../../../shared/lib/logger';
import type { ReportEntry } from '../../../../shared/lib/types';
import { runCreateStage } from '../index';

/** Mocks of the category agent module (hoisted so `vi.mock` can use them). */
const categoryMock = vi.hoisted(() => ({
  createCategoryAgent: vi.fn(),
  classifyCategory: vi.fn(),
}));

vi.mock('../../../../agents/category', () => ({
  createCategoryAgent: categoryMock.createCategoryAgent,
}));

/** Whether the media integration tests should run. */
const RUN_INTEGRATION = process.env.RUN_MEDIA_INTEGRATION === 'true';

/** 1×1 transparent PNG used by the integration test. */
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/** Build a report entry with sensible defaults plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'abc',
    title: 'Pixel Navigator',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/abc/',
    selftext: '',
    external_url: 'https://github.com/me/app',
    flair: '',
    images: ['https://i.redd.it/a.jpg'],
    ...overrides,
  };
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
      sourceUrl: 'https://www.reddit.com/r/AynThor/comments/abc/',
      sections: [
        { heading: 'Description', body: 'Body.' },
        { heading: 'Setup guide', body: 'Install.' },
      ],
      projectUrl: 'https://github.com/me/app',
    },
  };
}

/** Build a create result with sensible defaults plus overrides. */
function makeCreateResult(
  overrides: Partial<CreateResult> = {},
): CreateResult {
  const slug = overrides.slug ?? 'pixel-navigator';
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
    ...overrides,
  };
}

describe('runCreateStage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryMock.createCategoryAgent.mockReturnValue({
      classifyCategory: categoryMock.classifyCategory,
    });
    categoryMock.classifyCategory.mockResolvedValue('app');
  });

  it('does not write anything in dry-run mode', async () => {
    const writeFile = vi.fn(
      (_path: string, _content: string): Promise<void> => Promise.resolve(),
    );
    const saveImage = vi.fn(
      (_options: DownloadImageOptions): Promise<MediaResult> =>
        Promise.resolve({ outputPath: 'x', bytes: 1 }),
    );

    const result = await runCreateStage(makeEntry(), {
      create: () => Promise.resolve(makeCreateResult()),
      dryRun: true,
      contentDir: '/tmp/content',
      publicContentDir: '/tmp/public',
      writeFile,
      saveImage,
    });

    expect(result.written).toBe(false);
    expect(result.slug).toBe('pixel-navigator');
    expect(writeFile).not.toHaveBeenCalled();
    expect(saveImage).not.toHaveBeenCalled();
  });

  it('writes the page and its media deterministically', async () => {
    const writeFile = vi.fn(
      (_path: string, _content: string): Promise<void> => Promise.resolve(),
    );
    const saveImage = vi.fn(
      (_options: DownloadImageOptions): Promise<MediaResult> =>
        Promise.resolve({ outputPath: 'x', bytes: 1 }),
    );

    const result = await runCreateStage(makeEntry(), {
      create: () => Promise.resolve(makeCreateResult()),
      contentDir: '/tmp/content',
      publicContentDir: '/tmp/public',
      writeFile,
      saveImage,
    });

    expect(result.written).toBe(true);
    expect(writeFile).toHaveBeenCalledWith(
      join('/tmp/content', 'pixel-navigator', 'index.md'),
      result.markdown,
    );
    expect(saveImage).toHaveBeenCalledWith({
      url: 'https://i.redd.it/a.jpg',
      outputPath: join('/tmp/public', 'pixel-navigator', 'preview.webp'),
    });
  });

  it('still writes the page when a media download fails', async () => {
    const writeFile = vi.fn(
      (_path: string, _content: string): Promise<void> => Promise.resolve(),
    );
    const saveImage = vi.fn(
      (_options: DownloadImageOptions): Promise<MediaResult> =>
        Promise.reject(new Error('HTTP 404')),
    );
    const onMediaError = vi.fn();

    const result = await runCreateStage(makeEntry(), {
      create: () => Promise.resolve(makeCreateResult()),
      contentDir: '/tmp/content',
      publicContentDir: '/tmp/public',
      writeFile,
      saveImage,
      onMediaError,
    });

    expect(result.written).toBe(true);
    expect(onMediaError).toHaveBeenCalledWith({
      url: 'https://i.redd.it/a.jpg',
      fileName: 'preview.webp',
      error: 'HTTP 404',
    });
    // The failed image is dropped from the frontmatter.
    expect(result.markdown).not.toContain(
      '/content/pixel-navigator/preview.webp',
    );
    expect(result.markdown).toContain('## Description');
    expect(writeFile).toHaveBeenCalledWith(
      join('/tmp/content', 'pixel-navigator', 'index.md'),
      result.markdown,
    );
  });

  it('passes the injected category as createOptions.categoryOverride', async () => {
    const create = vi.fn(
      (_entry: ReportEntry, _options: CreateOptions): Promise<CreateResult> =>
        Promise.resolve(makeCreateResult()),
    );

    await runCreateStage(makeEntry(), {
      create,
      classifyCategory: () => Promise.resolve('tool'),
      dryRun: true,
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[1]?.categoryOverride).toBe('tool');
    expect(categoryMock.createCategoryAgent).not.toHaveBeenCalled();
  });

  it('uses the default category agent when no classifier is injected', async () => {
    categoryMock.classifyCategory.mockResolvedValue('emulator');
    const create = vi.fn(
      (_entry: ReportEntry, _options: CreateOptions): Promise<CreateResult> =>
        Promise.resolve(makeCreateResult()),
    );

    await runCreateStage(makeEntry(), { create, dryRun: true });

    expect(categoryMock.createCategoryAgent).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[1]?.categoryOverride).toBe('emulator');
  });

  it('forwards categoryOptions to the default category agent', async () => {
    const create = vi.fn(
      (_entry: ReportEntry, _options: CreateOptions): Promise<CreateResult> =>
        Promise.resolve(makeCreateResult()),
    );
    const categoryOptions: CategoryAgentOptions = {
      backend: 'jev',
      threshold: 0.5,
    };

    await runCreateStage(makeEntry(), { create, dryRun: true, categoryOptions });

    expect(categoryMock.createCategoryAgent).toHaveBeenCalledWith(
      categoryOptions,
    );
  });

  it('continues without a category override when classification fails', async () => {
    const lines: string[] = [];
    const logger = createLogger({
      level: 'warn',
      write: (line): void => {
        lines.push(line);
      },
    });
    const create = vi.fn(
      (_entry: ReportEntry, _options: CreateOptions): Promise<CreateResult> =>
        Promise.resolve(makeCreateResult()),
    );

    const result = await runCreateStage(makeEntry(), {
      create,
      classifyCategory: () => Promise.reject(new Error('boom')),
      dryRun: true,
      categoryOptions: { logger },
    });

    expect(result.written).toBe(false);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[1]?.categoryOverride).toBeUndefined();
    expect(
      lines.some((line) => line.includes('category classification failed')),
    ).toBe(true);
  });

  it('continues without a category override when the default agent fails', async () => {
    categoryMock.classifyCategory.mockRejectedValue(new Error('agent down'));
    const create = vi.fn(
      (_entry: ReportEntry, _options: CreateOptions): Promise<CreateResult> =>
        Promise.resolve(makeCreateResult()),
    );

    await runCreateStage(makeEntry(), { create, dryRun: true });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[1]?.categoryOverride).toBeUndefined();
  });
});

describe.skipIf(!RUN_INTEGRATION)('runCreateStage (integration)', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('writes a real index.md and a real WebP file', async () => {
    dir = await mkdtemp(join(tmpdir(), 'create-stage-'));
    const contentDir = join(dir, 'content');
    const publicContentDir = join(dir, 'public');
    const png = Buffer.from(PNG_BASE64, 'base64');
    const saveImage = (options: DownloadImageOptions): Promise<MediaResult> =>
      realSaveImage({
        ...options,
        fetchImpl: () => Promise.resolve(new Response(png, { status: 200 })),
      });

    const result = await runCreateStage(makeEntry(), {
      create: () => Promise.resolve(makeCreateResult()),
      contentDir,
      publicContentDir,
      saveImage,
    });

    expect(result.written).toBe(true);
    const markdown = await readFile(
      join(contentDir, 'pixel-navigator', 'index.md'),
      'utf8',
    );
    expect(markdown).toContain('## Description');

    const webp = await readFile(
      join(publicContentDir, 'pixel-navigator', 'preview.webp'),
    );
    expect(webp.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(webp.subarray(8, 12).toString('ascii')).toBe('WEBP');
  });
});
