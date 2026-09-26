import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  extractProjectUrl,
  extractSourceUrl,
  loadContentIndex,
  matchCandidates,
  searchContent,
  type ContentCandidate,
} from '../index';

/** Fixture describing a single page written to a temporary content dir. */
interface PageFixture {
  title: string;
  description?: string;
  slug?: string;
  projectUrl?: string;
  sourceUrl?: string;
}

/** Build a candidate with sensible defaults plus overrides. */
function candidate(overrides: Partial<ContentCandidate> = {}): ContentCandidate {
  return {
    slug: 'example',
    title: 'Example',
    description: '',
    path: '/content/example/index.md',
    projectUrl: '',
    sourceUrl: '',
    ...overrides,
  };
}

/** Write a page fixture into `<dir>/<dirName>/index.md`. */
async function writePage(
  dir: string,
  dirName: string,
  fixture: PageFixture,
): Promise<void> {
  const pageDir = join(dir, dirName);
  await mkdir(pageDir, { recursive: true });
  const lines = [
    '---',
    `title: "${fixture.title}"`,
    `description: "${fixture.description ?? ''}"`,
    `slug: "${fixture.slug ?? dirName}"`,
    'category: "app"',
    '---',
    '',
    `source: [reddit.com](${fixture.sourceUrl ?? 'https://www.reddit.com/r/AynThor/comments/abc/x/'})`,
    '',
    '## Description',
    '',
    'Body text.',
    '',
    `See the project page: [github.com](${fixture.projectUrl ?? 'https://github.com/example/repo'})`,
  ];
  await writeFile(join(pageDir, 'index.md'), lines.join('\n'), 'utf8');
}

/** Run `fn` against a fresh temporary content directory, then clean it up. */
async function withTempContentDir(
  fn: (dir: string) => Promise<void>,
): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), 'content-search-'));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('extractProjectUrl', () => {
  it('reads the labelled "See the project page" link', () => {
    const body =
      'See the project page: [github.com](https://github.com/ChimeraGaming/PixelNavigator)';

    expect(extractProjectUrl(body)).toBe(
      'https://github.com/ChimeraGaming/PixelNavigator',
    );
  });

  it('falls back to the first GitHub URL in the body', () => {
    const body = 'Check https://github.com/example/thing for details.';

    expect(extractProjectUrl(body)).toBe('https://github.com/example/thing');
  });

  it('returns an empty string when there is no project URL', () => {
    expect(extractProjectUrl('No links here.')).toBe('');
  });
});

describe('extractSourceUrl', () => {
  it('reads the labelled source permalink', () => {
    const body =
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wfm4hc/x/)';

    expect(extractSourceUrl(body)).toBe(
      'https://www.reddit.com/r/AynThor/comments/1wfm4hc/x/',
    );
  });

  it('returns an empty string when there is no source link', () => {
    expect(extractSourceUrl('No source.')).toBe('');
  });
});

describe('loadContentIndex', () => {
  it('reads every page directory and extracts its fields', async () => {
    await withTempContentDir(async (dir) => {
      await writePage(dir, 'pixel-navigator', {
        title: 'Pixel Navigator',
        description: 'Android map companion',
        projectUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
        sourceUrl: 'https://www.reddit.com/r/AynThor/comments/1wfm4hc/x/',
      });
      await writePage(dir, 'zomboidds', { title: 'ZomboidDS' });

      const index = await loadContentIndex({ contentDir: dir });

      expect(index).toHaveLength(2);
      const pixel = index.find((item) => item.slug === 'pixel-navigator');
      expect(pixel).toEqual({
        slug: 'pixel-navigator',
        title: 'Pixel Navigator',
        description: 'Android map companion',
        path: join(dir, 'pixel-navigator', 'index.md'),
        projectUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
        sourceUrl: 'https://www.reddit.com/r/AynThor/comments/1wfm4hc/x/',
      });
    });
  });

  it('skips files and directories without an index.md', async () => {
    await withTempContentDir(async (dir) => {
      await writeFile(join(dir, 'README.md'), 'not a page', 'utf8');
      await mkdir(join(dir, 'empty-dir'), { recursive: true });
      await writePage(dir, 'real', { title: 'Real' });

      const index = await loadContentIndex({ contentDir: dir });

      expect(index.map((item) => item.slug)).toEqual(['real']);
    });
  });

  it('falls back to the directory name when the slug is missing', async () => {
    await withTempContentDir(async (dir) => {
      const pageDir = join(dir, 'no-slug');
      await mkdir(pageDir, { recursive: true });
      await writeFile(
        join(pageDir, 'index.md'),
        '---\ntitle: "No Slug"\n---\n\nBody.',
        'utf8',
      );

      const index = await loadContentIndex({ contentDir: dir });

      expect(index[0]?.slug).toBe('no-slug');
    });
  });

  it('returns an empty index for a missing directory', async () => {
    const index = await loadContentIndex({
      contentDir: join(tmpdir(), 'definitely-missing-content-dir'),
    });

    expect(index).toEqual([]);
  });

  it('returns the injected index without touching the filesystem', async () => {
    const injected = [candidate({ slug: 'injected' })];

    const index = await loadContentIndex({ index: injected });

    expect(index).toEqual(injected);
  });
});

describe('matchCandidates', () => {
  const index: ContentCandidate[] = [
    candidate({
      slug: 'pixel-navigator',
      title: 'Pixel Navigator',
      projectUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
    }),
    candidate({
      slug: 'zomboidds',
      title: 'ZomboidDS',
      projectUrl: 'https://github.com/example/zomboidds',
    }),
  ];

  it('matches by exact title', () => {
    expect(matchCandidates('Pixel Navigator', index).map((c) => c.slug)).toEqual([
      'pixel-navigator',
    ]);
  });

  it('matches by exact slug', () => {
    expect(matchCandidates('pixel-navigator', index).map((c) => c.slug)).toEqual([
      'pixel-navigator',
    ]);
  });

  it('matches by GitHub URL', () => {
    const result = matchCandidates(
      'https://github.com/ChimeraGaming/PixelNavigator',
      index,
    );

    expect(result[0]?.slug).toBe('pixel-navigator');
  });

  it('matches a title fragment', () => {
    expect(matchCandidates('Navigator', index).map((c) => c.slug)).toEqual([
      'pixel-navigator',
    ]);
  });

  it('ranks a repository URL match above a title match', () => {
    const result = matchCandidates(
      'https://github.com/example/zomboidds',
      index,
    );

    expect(result[0]?.slug).toBe('zomboidds');
  });

  it('returns an empty list for an empty query', () => {
    expect(matchCandidates('   ', index)).toEqual([]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(matchCandidates('Completely Unrelated', index)).toEqual([]);
  });
});

describe('searchContent', () => {
  it('searches a temporary content directory', async () => {
    await withTempContentDir(async (dir) => {
      await writePage(dir, 'pixel-navigator', {
        title: 'Pixel Navigator',
        projectUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
      });

      const byName = await searchContent('Pixel Navigator', {
        contentDir: dir,
      });
      const byUrl = await searchContent(
        'https://github.com/ChimeraGaming/PixelNavigator',
        { contentDir: dir },
      );

      expect(byName.map((c) => c.slug)).toEqual(['pixel-navigator']);
      expect(byUrl.map((c) => c.slug)).toEqual(['pixel-navigator']);
    });
  });

  it('searches an injected index without filesystem access', async () => {
    const result = await searchContent('Pixel Navigator', {
      index: [candidate({ slug: 'pixel-navigator', title: 'Pixel Navigator' })],
    });

    expect(result.map((c) => c.slug)).toEqual(['pixel-navigator']);
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('content-search integration', () => {
  it('finds the Pixel Navigator page by name', async () => {
    const results = await searchContent('Pixel Navigator');

    expect(results.map((candidate) => candidate.slug)).toContain(
      'pixel-navigator',
    );
  });

  it('finds the Pixel Navigator page by GitHub URL', async () => {
    const results = await searchContent(
      'https://github.com/ChimeraGaming/PixelNavigator',
    );

    expect(results[0]?.slug).toBe('pixel-navigator');
  });

  it('extracts the project URL of the Pixel Navigator page', async () => {
    const [pixel] = await searchContent('Pixel Navigator');

    expect(pixel?.projectUrl).toBe(
      'https://github.com/ChimeraGaming/PixelNavigator',
    );
  });
});
