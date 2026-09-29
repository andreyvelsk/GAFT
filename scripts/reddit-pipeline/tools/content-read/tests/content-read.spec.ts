import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contentPageExists, readContentPage } from '../index';

/** Run `fn` against a fresh temporary content directory, then clean it up. */
async function withTempContentDir(
  fn: (dir: string) => Promise<void>,
): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), 'content-read-'));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Write a minimal page into `<dir>/<slug>/index.md`. */
async function writePage(dir: string, slug: string): Promise<void> {
  const pageDir = join(dir, slug);
  await mkdir(pageDir, { recursive: true });
  const raw = [
    '---',
    'title: "Pixel Navigator"',
    'description: "Android map companion"',
    'slug: "pixel-navigator"',
    'category: "app"',
    '---',
    '',
    '## Description',
    '',
    'Body text.',
  ].join('\n');
  await writeFile(join(pageDir, 'index.md'), raw, 'utf8');
}

describe('readContentPage', () => {
  it('returns the frontmatter, body and raw document', async () => {
    await withTempContentDir(async (dir) => {
      await writePage(dir, 'pixel-navigator');

      const page = await readContentPage('pixel-navigator', {
        contentDir: dir,
      });

      expect(page).not.toBeNull();
      expect(page?.slug).toBe('pixel-navigator');
      expect(page?.path).toBe(join(dir, 'pixel-navigator', 'index.md'));
      expect(page?.frontmatter.title).toBe('Pixel Navigator');
      expect(page?.frontmatter.category).toBe('app');
      expect(page?.content).toContain('## Description');
      expect(page?.raw).toContain('title: "Pixel Navigator"');
    });
  });

  it('returns null for a missing page', async () => {
    await withTempContentDir(async (dir) => {
      const page = await readContentPage('does-not-exist', {
        contentDir: dir,
      });

      expect(page).toBeNull();
    });
  });
});

describe('contentPageExists', () => {
  it('returns true for an existing page', async () => {
    await withTempContentDir(async (dir) => {
      await writePage(dir, 'pixel-navigator');

      expect(
        await contentPageExists('pixel-navigator', { contentDir: dir }),
      ).toBe(true);
    });
  });

  it('returns false for a missing page', async () => {
    await withTempContentDir(async (dir) => {
      expect(await contentPageExists('nope', { contentDir: dir })).toBe(false);
    });
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('content-read integration', () => {
  it('reads the real Pixel Navigator page', async () => {
    const page = await readContentPage('pixel-navigator');

    expect(page).not.toBeNull();
    expect(page?.frontmatter.title).toBe('Pixel Navigator');
    expect(page?.content).toContain('## Description');
    expect(page?.content).toContain('## Setup guide');
  });

  it('reports that the real Pixel Navigator page exists', async () => {
    expect(await contentPageExists('pixel-navigator')).toBe(true);
  });
});
