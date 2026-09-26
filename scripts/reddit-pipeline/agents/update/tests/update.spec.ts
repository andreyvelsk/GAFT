import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';

import { parseFrontmatter } from '../../../content/frontmatter';
import type { GitHubSearchItem } from '../../../github/client';
import { fetchPostById, parsePostId } from '../../../reddit/client';
import { postToReport } from '../../../reddit/normalize';
import { AgentError } from '../../../shared/lib/errors';
import type { ReportEntry } from '../../../shared/lib/types';
import {
  REPAIR_INSTRUCTION,
  createProvider,
  type GenerateObjectLike,
  type GenerateObjectOptions,
  type GenerateObjectResultLike,
} from '../../provider';
import { readContentPage, type ContentPage } from '../../tools/content-read';
import {
  UPDATE_SYSTEM_PROMPT,
  applyPatch,
  buildUpdatePrompt,
  gatherUpdateContext,
  updatePage,
  updatePatchSchema,
  type UpdateContext,
  type UpdatePatch,
} from '../index';

/** Canonical repository URL reused across the tests. */
const REPO_URL = 'https://github.com/ChimeraGaming/PixelNavigator';

/** Image URLs reused across the tests. */
const IMAGE_A = 'https://i.redd.it/a.jpg';
const IMAGE_B = 'https://i.redd.it/b.jpg';

/** Raw markdown of the standard test page. */
const STANDARD_RAW = [
  '---',
  'title: "Pixel Navigator"',
  'description: "Android map companion"',
  'date: "2026-09-01 10:00"',
  'slug: "pixel-navigator"',
  'category: "app"',
  'media:',
  '  - type: "image"',
  '    url: "/content/pixel-navigator/preview.webp"',
  '---',
  '',
  'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc123/)',
  '',
  '## Description',
  '',
  'Old description.',
  '',
  '## Setup guide',
  '',
  '1. Old step.',
  '',
  `See the project page: [github.com](${REPO_URL})`,
].join('\n');

/** Raw markdown of a page with a custom section, tags and two images. */
const RICH_RAW = [
  '---',
  'title: "Eden DS"',
  'description: "An emulator fork"',
  'date: "2026-08-29 12:59"',
  'slug: "eden-ds"',
  'category: "emulation"',
  'tags:',
  '  - "emulator"',
  '  - "zelda"',
  'media:',
  '  - type: "image"',
  '    url: "/content/eden-ds/preview.webp"',
  '  - type: "image"',
  '    url: "/content/eden-ds/screenshot-2.webp"',
  '---',
  '',
  'source: [reddit](https://www.reddit.com/r/AynThor/comments/1vya2n0/x/)',
  '',
  '## Description',
  '',
  'Eden DS description.',
  '',
  '## Supported games',
  '',
  '- Zelda: Breath of the Wild',
  '',
  '## Setup guide',
  '',
  '1. Install it.',
  '',
  'See the project page: [github.com](https://github.com/JoeCorrell/Eden-DS)',
].join('\n');

/** Build a report entry from a base payload plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'abc123',
    title: 'Pixel Navigator update',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/abc123/',
    selftext: '',
    external_url: REPO_URL,
    flair: '',
    images: [IMAGE_A, IMAGE_B],
    ...overrides,
  };
}

/** Build a research context with sensible defaults plus overrides. */
function makeContext(overrides: Partial<UpdateContext> = {}): UpdateContext {
  return {
    repo: {
      owner: 'ChimeraGaming',
      repo: 'PixelNavigator',
      fullName: 'ChimeraGaming/PixelNavigator',
      htmlUrl: REPO_URL,
      description: 'Android map companion',
      stars: 42,
      defaultBranch: 'main',
    },
    readme: '# Pixel Navigator\n\nMaps on the second screen.',
    release: {
      tagName: 'v1.2.0',
      name: 'Version 1.2.0',
      publishedAt: '2026-09-01T00:00:00Z',
      url: `${REPO_URL}/releases/latest`,
      htmlUrl: `${REPO_URL}/releases/tag/v1.2.0`,
    },
    ...overrides,
  };
}

/** Parse a raw markdown document into a content page. */
function pageFromRaw(raw: string, slug = 'pixel-navigator'): ContentPage {
  const { data, content } = parseFrontmatter(raw);
  return {
    slug,
    path: `/content/${slug}/index.md`,
    frontmatter: data,
    content,
    raw,
  };
}

/** Build the standard test page. */
function makePage(): ContentPage {
  return pageFromRaw(STANDARD_RAW);
}

/** Build a page with a custom section, tags and two images. */
function makeRichPage(): ContentPage {
  return pageFromRaw(RICH_RAW, 'eden-ds');
}

/** Build a real (but never-called) language model for the injected generator. */
function testModel(): LanguageModel {
  return createProvider({ apiKey: 'test-key' })('test/model');
}

/** A generator plus the options it recorded, in call order. */
interface RecordingGenerator {
  generate: GenerateObjectLike;
  calls: GenerateObjectOptions[];
}

/** Build a generator that records its calls and delegates to `handler`. */
function recordingGenerator(
  handler: (
    options: GenerateObjectOptions,
    index: number,
  ) => Promise<GenerateObjectResultLike>,
): RecordingGenerator {
  const calls: GenerateObjectOptions[] = [];
  const generate: GenerateObjectLike = (options) => {
    calls.push(options);
    return handler(options, calls.length - 1);
  };
  return { generate, calls };
}

/** A generator that always resolves with the given raw object. */
function staticGenerator(object: unknown): RecordingGenerator {
  return recordingGenerator(() => Promise.resolve({ object }));
}

/** Extract the URL from any accepted fetch input without assertions. */
function inputUrl(input: string | URL | Request): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

/** Build a fetch implementation that records calls and delegates to `handler`. */
function createFetch(
  handler: (url: string) => Promise<Response>,
): typeof fetch {
  return async (input) => await handler(inputUrl(input));
}

/** Build a fetch implementation that always returns the same response. */
function staticFetch(response: Response): typeof fetch {
  return createFetch(() => Promise.resolve(response));
}

/** Build a JSON `Response` for the mocked `fetch`. */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Build a plain-text `Response` for the mocked `fetch`. */
function textResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

/** Build a minimal search item with overrides. */
function searchItem(overrides: Partial<GitHubSearchItem> = {}): GitHubSearchItem {
  return {
    full_name: 'ChimeraGaming/PixelNavigator',
    name: 'PixelNavigator',
    owner: { login: 'ChimeraGaming' },
    html_url: REPO_URL,
    description: 'Android map companion',
    stargazers_count: 42,
    default_branch: 'main',
    ...overrides,
  };
}

/** Load a report entry from a Reddit permalink (id → post → normalize). */
async function loadEntry(url: string): Promise<ReportEntry> {
  const id = parsePostId(url);
  if (id === null) {
    throw new Error(`cannot extract post id from url: ${url}`);
  }
  const post = await fetchPostById(id);
  if (post === null) {
    throw new Error(`post ${id} not found`);
  }
  return postToReport(post);
}

/** Count the non-overlapping occurrences of `needle` in `haystack`. */
function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('UPDATE_SYSTEM_PROMPT', () => {
  it('instructs the model to write for the end user', () => {
    expect(UPDATE_SYSTEM_PROMPT).toContain('END USER');
    expect(UPDATE_SYSTEM_PROMPT).toContain('latest release');
  });

  it('requires a short description and the controlled category vocabulary', () => {
    expect(UPDATE_SYSTEM_PROMPT).toContain('ONE short sentence');
    expect(UPDATE_SYSTEM_PROMPT).toContain('"companion"');
  });

  it('asks for the project name and the required sections', () => {
    expect(UPDATE_SYSTEM_PROMPT).toContain('PROJECT NAME');
    expect(UPDATE_SYSTEM_PROMPT).toContain('"Setup guide" are REQUIRED');
  });
});

describe('updatePatchSchema', () => {
  it('accepts a valid category', () => {
    expect(updatePatchSchema.parse({ category: 'port', reason: 'r' }).category).toBe(
      'port',
    );
  });

  it('rejects an unknown category', () => {
    expect(() =>
      updatePatchSchema.parse({ category: 'emulation', reason: 'r' }),
    ).toThrow();
  });

  it('rejects more than five sections', () => {
    const sections = Array.from({ length: 6 }, (_, index) => ({
      heading: `Section ${index}`,
      body: 'x',
    }));

    expect(() => updatePatchSchema.parse({ sections, reason: 'r' })).toThrow();
  });

  it('rejects sections without Setup guide', () => {
    expect(() =>
      updatePatchSchema.parse({
        sections: [{ heading: 'Description', body: 'x' }],
        reason: 'r',
      }),
    ).toThrow();
  });
});

describe('buildUpdatePrompt', () => {
  it('includes the current page, the post id and the latest release URL', () => {
    const prompt = buildUpdatePrompt(
      makePage(),
      makeEntry({ id: 'p1' }),
      makeContext(),
    );

    expect(prompt).toContain('"pixel-navigator"');
    expect(prompt).toContain('"p1"');
    expect(prompt).toContain(`${REPO_URL}/releases/latest`);
    expect(prompt).toContain('Old description.');
  });

  it('renders nulls when the context is empty', () => {
    const prompt = buildUpdatePrompt(makePage(), makeEntry(), {
      repo: null,
      readme: null,
      release: null,
    });

    expect(prompt).toContain('Repository (may be null):');
    expect(prompt).toContain('README (may be null):');
    expect(prompt).toContain('null');
  });
});

describe('applyPatch', () => {
  it('changes only the provided sections and records them', () => {
    const patch: UpdatePatch = {
      sections: [
        { heading: 'Description', body: 'New description.' },
        { heading: 'Setup guide', body: '1. Old step.' },
      ],
      reason: 'new release',
    };

    const applied = applyPatch(
      makePage(),
      patch,
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.changed).toEqual(['sections']);
    expect(applied.page.sections.sections[0]?.body).toBe('New description.');
  });

  it('preserves the fields that are not in the patch', () => {
    const patch: UpdatePatch = {
      sections: [
        { heading: 'Description', body: 'New description.' },
        { heading: 'Setup guide', body: '1. Old step.' },
      ],
      reason: 'new release',
    };

    const applied = applyPatch(
      makePage(),
      patch,
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.frontmatter.title).toBe('Pixel Navigator');
    expect(applied.page.frontmatter.category).toBe('app');
    expect(applied.page.frontmatter.date).toBe('2026-09-01 10:00');
    expect(applied.page.sections.projectUrl).toBe(REPO_URL);
    expect(applied.page.sections.sourceUrl).toBe(
      'https://www.reddit.com/r/AynThor/comments/abc123/',
    );
  });

  it('does not record a field whose value is unchanged', () => {
    const patch: UpdatePatch = { title: 'Pixel Navigator', reason: 'no-op' };

    const applied = applyPatch(
      makePage(),
      patch,
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.changed).toEqual([]);
  });

  it('preserves custom sections when the patch omits them', () => {
    const applied = applyPatch(
      makeRichPage(),
      { reason: 'no-op' },
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.sections.sections.map((section) => section.heading)).toEqual(
      ['Description', 'Supported games', 'Setup guide'],
    );
  });

  it('preserves unknown frontmatter keys', () => {
    const applied = applyPatch(
      makeRichPage(),
      { reason: 'no-op' },
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.extraFrontmatter).toEqual({
      tags: ['emulator', 'zelda'],
    });
  });

  it('uses the patch project URL when there is no repository', () => {
    const applied = applyPatch(
      makePage(),
      {
        project_url: 'https://play.google.com/store/apps/details?id=x',
        reason: 'store link',
      },
      makeEntry({ external_url: 'https://i.redd.it/a.jpg' }),
      makeContext({ repo: null, release: null, readme: null }),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.sections.projectUrl).toBe(
      'https://play.google.com/store/apps/details?id=x',
    );
  });

  it('preserves the existing project URL when nothing new is provided', () => {
    const applied = applyPatch(
      makePage(),
      { reason: 'no-op' },
      makeEntry({ external_url: 'https://i.redd.it/a.jpg' }),
      makeContext({ repo: null, release: null, readme: null }),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.sections.projectUrl).toBe(REPO_URL);
  });

  it('keeps the existing page date on update', () => {
    const applied = applyPatch(
      makePage(),
      { reason: 'no-op' },
      makeEntry(),
      makeContext(),
      new Date('2030-01-01T00:00:00Z'),
    );

    expect(applied.page.frontmatter.date).toBe('2026-09-01 10:00');
  });

  it('preserves an existing video when the patch replaces images', () => {
    const page = pageFromRaw(
      [
        '---',
        'title: "X"',
        'description: "D"',
        'date: "2026-09-01 10:00"',
        'slug: "x"',
        'category: "app"',
        'media:',
        '  - type: "image"',
        '    url: "/content/x/preview.webp"',
        '  - type: "video"',
        '    url: "https://www.youtube.com/watch?v=abc"',
        '---',
        '',
        '## Description',
        '',
        'Body.',
        '',
        '## Setup guide',
        '',
        'Steps.',
      ].join('\n'),
      'x',
    );

    const applied = applyPatch(
      page,
      { media: [IMAGE_B], reason: 'new screenshot' },
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.frontmatter.media).toEqual([
      { type: 'image', url: '/content/x/preview.webp' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=abc' },
    ]);
  });

  it('adds a YouTube video from the post when the page has none', () => {
    const applied = applyPatch(
      makePage(),
      { reason: 'video' },
      makeEntry({ video_url: 'https://youtu.be/abc123' }),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.changed).toContain('media');
    expect(applied.page.frontmatter.media).toContainEqual({
      type: 'video',
      url: 'https://youtu.be/abc123',
    });
  });

  it('preserves the existing media when the patch omits it', () => {
    const applied = applyPatch(
      makeRichPage(),
      { reason: 'no-op' },
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.media).toEqual([]);
    expect(applied.page.frontmatter.media).toHaveLength(2);
  });

  it('replaces the media when the patch provides new images', () => {
    const patch: UpdatePatch = { media: [IMAGE_B], reason: 'new screenshot' };

    const applied = applyPatch(
      makePage(),
      patch,
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.changed).toEqual(['media']);
    expect(applied.media).toEqual([{ url: IMAGE_B, fileName: 'preview.webp' }]);
    expect(applied.page.frontmatter.media).toEqual([
      { type: 'image', url: '/content/pixel-navigator/preview.webp' },
    ]);
  });

  it('falls back to the post permalink when the page has no source link', () => {
    const page = pageFromRaw(
      [
        '---',
        'title: "X"',
        'description: "D"',
        'date: "2026-09-01 10:00"',
        'slug: "x"',
        'category: "app"',
        '---',
        '',
        '## Description',
        '',
        'Body.',
      ].join('\n'),
      'x',
    );

    const applied = applyPatch(
      page,
      { reason: 'no-op' },
      makeEntry(),
      makeContext(),
      new Date('2026-09-26T10:16:00Z'),
    );

    expect(applied.page.sections.sourceUrl).toBe(
      'https://www.reddit.com/r/AynThor/comments/abc123/',
    );
  });
});

describe('gatherUpdateContext', () => {
  it('resolves the repository, README and latest release', async () => {
    const fetchImpl = createFetch((url) => {
      if (url.endsWith('/readme')) {
        return Promise.resolve(textResponse('# Pixel Navigator\n'));
      }
      if (url.endsWith('/releases/latest')) {
        return Promise.resolve(
          jsonResponse({
            tag_name: 'v1.0.0',
            name: 'v1.0.0',
            html_url: `${REPO_URL}/releases/tag/v1.0.0`,
            published_at: '2026-09-01T00:00:00Z',
          }),
        );
      }
      return Promise.resolve(jsonResponse(searchItem()));
    });

    const context = await gatherUpdateContext(makeEntry(), {
      repoOptions: { fetchImpl },
    });

    expect(context.repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    expect(context.readme).toBe('# Pixel Navigator\n');
    expect(context.release?.url).toBe(`${REPO_URL}/releases/latest`);
  });

  it('returns an empty context when no repository is found', async () => {
    const fetchImpl = staticFetch(jsonResponse({ total_count: 0, items: [] }));

    const context = await gatherUpdateContext(
      makeEntry({ title: 'Nonexistent', external_url: '' }),
      { repoOptions: { fetchImpl } },
    );

    expect(context).toEqual({ repo: null, readme: null, release: null });
  });

  it('finds the repository from a GitHub link in the body', async () => {
    const fetchImpl = createFetch((url) => {
      if (url.endsWith('/readme')) {
        return Promise.resolve(textResponse('# Pixel Navigator\n'));
      }
      if (url.endsWith('/releases/latest')) {
        return Promise.resolve(textResponse('', 404));
      }
      return Promise.resolve(jsonResponse(searchItem()));
    });

    const context = await gatherUpdateContext(
      makeEntry({
        external_url: 'https://i.redd.it/a.jpg',
        selftext: 'Source: https://github.com/ChimeraGaming/PixelNavigator',
      }),
      { repoOptions: { fetchImpl } },
    );

    expect(context.repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
  });

  it('returns an empty context when the repository lookup fails', async () => {
    const fetchImpl = staticFetch(textResponse('', 404));

    const context = await gatherUpdateContext(
      makeEntry({ external_url: 'https://github.com/JoeCorrell/Eden-DS' }),
      { repoOptions: { fetchImpl } },
    );

    expect(context).toEqual({ repo: null, readme: null, release: null });
  });
});

describe('updatePage', () => {
  it('applies the patch and renders the updated page', async () => {
    const { generate } = staticGenerator({
      sections: [
        { heading: 'Description', body: 'New description.' },
        { heading: 'Setup guide', body: '1. Old step.' },
      ],
      reason: 'new release',
    });

    const result = await updatePage(makePage(), makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(result.slug).toBe('pixel-navigator');
    expect(result.changed).toEqual(['sections']);
    expect(result.markdown).toContain('New description.');
    expect(result.markdown).toContain('## Setup guide');
    expect(result.markdown).toContain('1. Old step.');
  });

  it('does not duplicate sections when the patch echoes the whole page', async () => {
    const full = [
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc123/)',
      '',
      '## Description',
      '',
      'New description.',
      '',
      '## Setup guide',
      '',
      '1. New step.',
      '',
      `See the project page: [github.com](${REPO_URL})`,
    ].join('\n');
    const { generate } = staticGenerator({
      sections: [
        { heading: 'Description', body: full },
        { heading: 'Setup guide', body: full },
      ],
      reason: 'echo',
    });

    const result = await updatePage(makePage(), makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(countOccurrences(result.markdown, '## Description')).toBe(1);
    expect(countOccurrences(result.markdown, '## Setup guide')).toBe(1);
    expect(countOccurrences(result.markdown, 'source: [reddit.com]')).toBe(1);
    expect(countOccurrences(result.markdown, 'See the project page:')).toBe(1);
    expect(result.page.sections.sections).toEqual([
      { heading: 'Description', body: 'New description.' },
      { heading: 'Setup guide', body: '1. New step.' },
    ]);
  });

  it('sends temperature 0, the update system prompt and a schema name', async () => {
    const { generate, calls } = staticGenerator({ reason: 'no-op' });

    await updatePage(makePage(), makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(calls[0]?.temperature).toBe(0);
    expect(calls[0]?.system).toBe(UPDATE_SYSTEM_PROMPT);
    expect(calls[0]?.schemaName).toBe('update_patch');
  });

  it('repairs an invalid output and then succeeds', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { not: 'a patch' } }
          : {
              object: {
                sections: [
                  { heading: 'Description', body: 'New description.' },
                  { heading: 'Setup guide', body: '1. Old step.' },
                ],
                reason: 'r',
              },
            },
      ),
    );

    const result = await updatePage(makePage(), makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(result.changed).toEqual(['sections']);
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('throws an AgentError when every attempt is invalid', async () => {
    const { generate } = staticGenerator({ not: 'a patch' });

    await expect(
      updatePage(makePage(), makeEntry(), {
        generate,
        model: testModel(),
        context: makeContext(),
        maxRepairAttempts: 0,
      }),
    ).rejects.toBeInstanceOf(AgentError);
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';
const hasApiKey = (process.env.OPENROUTER_API_KEY ?? '') !== '';

describe.skipIf(!runIntegration || !hasApiKey)('update integration', () => {
  it(
    'updates the real Pixel Navigator page from a real post',
    async () => {
      const page = await readContentPage('pixel-navigator');
      if (page === null) {
        throw new Error('pixel-navigator page not found');
      }
      const entry = await loadEntry(
        'https://www.reddit.com/r/AynThor/comments/1wfm4hc/its_amazing_how_every_rom_can_be_so_diverse_also/',
      );

      const result = await updatePage(page, entry);

      expect(result.slug).toBe('pixel-navigator');
      expect(result.markdown).toContain('## Description');
      expect(result.markdown).toContain('## Setup guide');
      expect(result.markdown).not.toContain('/releases/tag/');
    },
    120000,
  );
});
