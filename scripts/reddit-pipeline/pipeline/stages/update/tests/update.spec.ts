import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ContentPage } from '../../../../agents/tools/content-read';
import type { UpdateResult } from '../../../../agents/update';
import {
  saveImage as realSaveImage,
  type DownloadImageOptions,
  type MediaResult,
} from '../../../../content/media';
import type { PageInput } from '../../../../content/template';
import { ValidationError } from '../../../../shared/lib/errors';
import type { ReportEntry } from '../../../../shared/lib/types';
import { runUpdateStage } from '../index';

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

/** Build a content page with sensible defaults plus overrides. */
function makeContentPage(slug: string): ContentPage {
  return {
    slug,
    path: `/tmp/content/${slug}/index.md`,
    frontmatter: {
      title: 'Pixel Navigator',
      description: 'Android map companion.',
      date: '2026-01-01 00:00',
      slug,
      category: 'app',
      media: [{ type: 'image', url: `/content/${slug}/preview.webp` }],
    },
    content: '\n## Description\n\nBody.\n',
    raw: '---\n---\n',
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

/** Build an update result with sensible defaults plus overrides. */
function makeUpdateResult(
  overrides: Partial<UpdateResult> = {},
): UpdateResult {
  const slug = overrides.slug ?? 'pixel-navigator';
  return {
    slug,
    patch: { reason: 'new release' },
    context: { repo: null, readme: null, release: null },
    page: makePage(slug),
    markdown: '---\ntitle: "Pixel Navigator"\n---\n\n## Description\n\nBody.\n',
    media: [{ url: 'https://i.redd.it/a.jpg', fileName: 'preview.webp' }],
    changed: ['description'],
    ...overrides,
  };
}

describe('runUpdateStage', () => {
  it('throws a validation error when the page does not exist', async () => {
    await expect(
      runUpdateStage(makeEntry(), 'missing', {
        readPage: () => Promise.resolve(null),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('does not write anything in dry-run mode', async () => {
    const writeFile = vi.fn(
      (_path: string, _content: string): Promise<void> => Promise.resolve(),
    );
    const saveImage = vi.fn(
      (_options: DownloadImageOptions): Promise<MediaResult> =>
        Promise.resolve({ outputPath: 'x', bytes: 1 }),
    );

    const result = await runUpdateStage(makeEntry(), 'pixel-navigator', {
      readPage: () => Promise.resolve(makeContentPage('pixel-navigator')),
      update: () => Promise.resolve(makeUpdateResult()),
      dryRun: true,
      contentDir: '/tmp/content',
      publicContentDir: '/tmp/public',
      writeFile,
      saveImage,
    });

    expect(result.written).toBe(false);
    expect(result.changed).toEqual(['description']);
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

    const result = await runUpdateStage(makeEntry(), 'pixel-navigator', {
      readPage: () => Promise.resolve(makeContentPage('pixel-navigator')),
      update: () => Promise.resolve(makeUpdateResult()),
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
});

describe.skipIf(!RUN_INTEGRATION)('runUpdateStage (integration)', () => {
  let dir: string | null = null;

  afterEach(async () => {
    if (dir !== null) {
      await rm(dir, { recursive: true, force: true });
      dir = null;
    }
  });

  it('writes a real index.md and a real WebP file', async () => {
    dir = await mkdtemp(join(tmpdir(), 'update-stage-'));
    const contentDir = join(dir, 'content');
    const publicContentDir = join(dir, 'public');
    const png = Buffer.from(PNG_BASE64, 'base64');
    const saveImage = (options: DownloadImageOptions): Promise<MediaResult> =>
      realSaveImage({
        ...options,
        fetchImpl: () => Promise.resolve(new Response(png, { status: 200 })),
      });

    const result = await runUpdateStage(makeEntry(), 'pixel-navigator', {
      readPage: () => Promise.resolve(makeContentPage('pixel-navigator')),
      update: () => Promise.resolve(makeUpdateResult()),
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
