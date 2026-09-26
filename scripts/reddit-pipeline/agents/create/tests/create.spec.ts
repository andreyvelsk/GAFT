import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';

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
import {
  CREATE_SYSTEM_PROMPT,
  buildCreatePageInput,
  buildCreatePrompt,
  buildMediaPlan,
  createPage,
  gatherCreateContext,
  resolveSlug,
  type CreateContext,
  type CreateDraft,
} from '../index';

/** Canonical repository URL reused across the tests. */
const REPO_URL = 'https://github.com/ChimeraGaming/PixelNavigator';

/** Image URLs reused across the tests. */
const IMAGE_A = 'https://i.redd.it/a.jpg';
const IMAGE_B = 'https://i.redd.it/b.jpg';
const IMAGE_C = 'https://i.redd.it/c.jpg';
const IMAGE_D = 'https://i.redd.it/d.jpg';

/** Build a report entry from a base payload plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'abc123',
    title: 'Pixel Navigator',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/abc123/',
    selftext: '',
    external_url: REPO_URL,
    flair: '',
    images: [IMAGE_A, IMAGE_B, IMAGE_C, IMAGE_D],
    ...overrides,
  };
}

/** Build a research context with sensible defaults plus overrides. */
function makeContext(overrides: Partial<CreateContext> = {}): CreateContext {
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

/** Build a draft with sensible defaults plus overrides. */
function makeDraft(overrides: Partial<CreateDraft> = {}): CreateDraft {
  return {
    title: 'Pixel Navigator',
    description: 'Android map companion for emulated games.',
    category: 'app',
    slug: 'pixel-navigator',
    sections: [
      {
        heading: 'Description',
        body: 'Pixel Navigator shows maps on the second screen.',
      },
      {
        heading: 'Setup guide',
        body: '1. Download the APK from the latest release.',
      },
    ],
    media: [IMAGE_A],
    ...overrides,
  };
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

describe('CREATE_SYSTEM_PROMPT', () => {
  it('instructs the model to write for the end user', () => {
    expect(CREATE_SYSTEM_PROMPT).toContain('END USER');
    expect(CREATE_SYSTEM_PROMPT).toContain('latest release');
  });
});

describe('buildCreatePrompt', () => {
  it('includes the post id, the repository and the latest release URL', () => {
    const prompt = buildCreatePrompt(makeEntry({ id: 'p1' }), makeContext());

    expect(prompt).toContain('"p1"');
    expect(prompt).toContain('ChimeraGaming/PixelNavigator');
    expect(prompt).toContain(`${REPO_URL}/releases/latest`);
    expect(prompt).toContain('Maps on the second screen.');
  });

  it('renders nulls when the context is empty', () => {
    const prompt = buildCreatePrompt(makeEntry(), {
      repo: null,
      readme: null,
      release: null,
    });

    expect(prompt).toContain('Repository (may be null):');
    expect(prompt).toContain('README (may be null):');
    expect(prompt).toContain('null');
  });

  it('truncates a very long selftext', () => {
    const long = 'x'.repeat(3000);
    const prompt = buildCreatePrompt(makeEntry({ selftext: long }), makeContext());

    expect(prompt).not.toContain(long);
    expect(prompt).toContain('…');
  });
});

describe('resolveSlug', () => {
  it('normalizes the draft slug to kebab-case', () => {
    expect(resolveSlug(makeEntry(), makeDraft({ slug: 'Pixel Navigator!' }))).toBe(
      'pixel-navigator',
    );
  });

  it('falls back to the post title when the slug is blank', () => {
    expect(
      resolveSlug(makeEntry({ title: 'Thor Widgets' }), makeDraft({ slug: '  ' })),
    ).toBe('thor-widgets');
  });
});

describe('buildMediaPlan', () => {
  it('names the first image preview.webp and the rest screenshot-N.webp', () => {
    expect(buildMediaPlan([IMAGE_A, IMAGE_B, IMAGE_C])).toEqual([
      { url: IMAGE_A, fileName: 'preview.webp' },
      { url: IMAGE_B, fileName: 'screenshot-2.webp' },
      { url: IMAGE_C, fileName: 'screenshot-3.webp' },
    ]);
  });

  it('returns an empty plan for no images', () => {
    expect(buildMediaPlan([])).toEqual([]);
  });
});

describe('buildCreatePageInput', () => {
  it('builds the frontmatter, media paths and sections', () => {
    const page = buildCreatePageInput({
      draft: makeDraft(),
      entry: makeEntry(),
      context: makeContext(),
      mediaUrls: [IMAGE_A, IMAGE_B],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.frontmatter).toEqual({
      title: 'Pixel Navigator',
      description: 'Android map companion for emulated games.',
      date: '2026-09-26 10:16',
      slug: 'pixel-navigator',
      category: 'app',
      media: [
        { type: 'image', url: '/content/pixel-navigator/preview.webp' },
        { type: 'image', url: '/content/pixel-navigator/screenshot-2.webp' },
      ],
    });
    expect(page.sections.sourceUrl).toBe(
      'https://www.reddit.com/r/AynThor/comments/abc123/',
    );
    expect(page.sections.projectUrl).toBe(REPO_URL);
    expect(page.sections.sections).toEqual([
      {
        heading: 'Description',
        body: 'Pixel Navigator shows maps on the second screen.',
      },
      {
        heading: 'Setup guide',
        body: '1. Download the APK from the latest release.',
      },
    ]);
  });

  it('keeps extra sections in order', () => {
    const page = buildCreatePageInput({
      draft: makeDraft({
        sections: [
          { heading: 'Description', body: 'D.' },
          { heading: 'Supported games', body: '- Game one' },
          { heading: 'Setup guide', body: 'S.' },
        ],
      }),
      entry: makeEntry(),
      context: makeContext(),
      mediaUrls: [],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.sections.sections.map((section) => section.heading)).toEqual([
      'Description',
      'Supported games',
      'Setup guide',
    ]);
  });

  it('falls back to the external URL when there is no repository', () => {
    const page = buildCreatePageInput({
      draft: makeDraft(),
      entry: makeEntry({ external_url: 'https://example.com/app' }),
      context: makeContext({ repo: null, release: null, readme: null }),
      mediaUrls: [],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.sections.projectUrl).toBe('https://example.com/app');
  });

  it('uses the draft project URL when there is no repository', () => {
    const page = buildCreatePageInput({
      draft: makeDraft({
        project_url: 'https://play.google.com/store/apps/details?id=x',
      }),
      entry: makeEntry({ external_url: 'https://i.redd.it/a.jpg' }),
      context: makeContext({ repo: null, release: null, readme: null }),
      mediaUrls: [],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.sections.projectUrl).toBe(
      'https://play.google.com/store/apps/details?id=x',
    );
  });

  it('ignores an image URL as the project link', () => {
    const page = buildCreatePageInput({
      draft: makeDraft({ project_url: 'https://i.redd.it/a.jpg' }),
      entry: makeEntry({ external_url: 'https://i.redd.it/a.jpg' }),
      context: makeContext({ repo: null, release: null, readme: null }),
      mediaUrls: [],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.sections.projectUrl).toBe('');
  });

  it('falls back to a non-image external URL', () => {
    const page = buildCreatePageInput({
      draft: makeDraft(),
      entry: makeEntry({ external_url: 'https://gitlab.com/user/repo' }),
      context: makeContext({ repo: null, release: null, readme: null }),
      mediaUrls: [],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.sections.projectUrl).toBe('https://gitlab.com/user/repo');
  });

  it('normalizes release links inside the generated sections', () => {
    const page = buildCreatePageInput({
      draft: makeDraft({
        sections: [
          {
            heading: 'Setup guide',
            body: `1. Download from ${REPO_URL}/releases/tag/v1.2.0.`,
          },
        ],
      }),
      entry: makeEntry(),
      context: makeContext(),
      mediaUrls: [],
      slug: 'pixel-navigator',
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(page.sections.sections[0]?.body).toContain(
      `${REPO_URL}/releases/latest`,
    );
    expect(page.sections.sections[0]?.body).not.toContain('/releases/tag/');
  });
});

describe('gatherCreateContext', () => {
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

    const context = await gatherCreateContext(makeEntry(), {
      repoOptions: { fetchImpl },
    });

    expect(context.repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    expect(context.readme).toBe('# Pixel Navigator\n');
    expect(context.release?.url).toBe(`${REPO_URL}/releases/latest`);
  });

  it('returns an empty context when no repository is found', async () => {
    const fetchImpl = staticFetch(jsonResponse({ total_count: 0, items: [] }));

    const context = await gatherCreateContext(
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

    const context = await gatherCreateContext(
      makeEntry({
        external_url: 'https://i.redd.it/a.jpg',
        selftext: 'Source: https://github.com/ChimeraGaming/PixelNavigator',
      }),
      { repoOptions: { fetchImpl } },
    );

    expect(context.repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
  });

  it('strips trailing markdown from a GitHub link in the body', async () => {
    const urls: string[] = [];
    const fetchImpl: typeof fetch = (input) => {
      const url = inputUrl(input);
      urls.push(url);
      if (url.endsWith('/readme')) {
        return Promise.resolve(new Response('# Eden DS\n', { status: 200 }));
      }
      if (url.endsWith('/releases/latest')) {
        return Promise.resolve(new Response('', { status: 404 }));
      }
      return Promise.resolve(
        jsonResponse(
          searchItem({
            full_name: 'JoeCorrell/Eden-DS',
            name: 'Eden-DS',
            owner: { login: 'JoeCorrell' },
          }),
        ),
      );
    };

    await gatherCreateContext(
      makeEntry({
        external_url: 'https://i.redd.it/a.jpg',
        selftext: 'Repo: https://github.com/JoeCorrell/Eden-DS***',
      }),
      { repoOptions: { fetchImpl } },
    );

    expect(urls[0]).toContain('/repos/JoeCorrell/Eden-DS');
    expect(urls[0]).not.toContain('***');
  });

  it('returns an empty context when the repository lookup fails', async () => {
    const fetchImpl = staticFetch(textResponse('', 404));

    const context = await gatherCreateContext(
      makeEntry({ external_url: 'https://github.com/JoeCorrell/Eden-DS' }),
      { repoOptions: { fetchImpl } },
    );

    expect(context).toEqual({ repo: null, readme: null, release: null });
  });
});

describe('createPage', () => {
  it('returns a rendered page with the standard sections', async () => {
    const { generate } = staticGenerator(makeDraft());

    const result = await createPage(makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
      now: new Date('2026-09-26T10:16:00Z'),
    });

    expect(result.slug).toBe('pixel-navigator');
    expect(result.markdown).toContain('## Description');
    expect(result.markdown).toContain('## Setup guide');
    expect(result.markdown).toContain('source: [reddit.com]');
    expect(result.markdown).toContain(`See the project page: [github.com](${REPO_URL})`);
    expect(result.media).toEqual([{ url: IMAGE_A, fileName: 'preview.webp' }]);
  });

  it('does not duplicate sections when the draft echoes the whole page', async () => {
    const full = [
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc123/)',
      '',
      '## Description',
      '',
      'The description.',
      '',
      '## Setup guide',
      '',
      '1. Install it.',
      '',
      `See the project page: [github.com](${REPO_URL})`,
    ].join('\n');
    const { generate } = staticGenerator(
      makeDraft({
        sections: [
          { heading: 'Description', body: full },
          { heading: 'Setup guide', body: full },
        ],
      }),
    );

    const result = await createPage(makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(countOccurrences(result.markdown, '## Description')).toBe(1);
    expect(countOccurrences(result.markdown, '## Setup guide')).toBe(1);
    expect(countOccurrences(result.markdown, 'source: [reddit.com]')).toBe(1);
    expect(countOccurrences(result.markdown, 'See the project page:')).toBe(1);
    expect(result.page.sections.sections).toEqual([
      { heading: 'Description', body: 'The description.' },
      { heading: 'Setup guide', body: '1. Install it.' },
    ]);
  });

  it('keeps only the requested images that exist in the post', async () => {
    const { generate } = staticGenerator(
      makeDraft({ media: [IMAGE_B, 'https://evil.example/x.jpg'] }),
    );

    const result = await createPage(makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(result.media).toEqual([{ url: IMAGE_B, fileName: 'preview.webp' }]);
  });

  it('falls back to the post images when the draft selects none', async () => {
    const { generate } = staticGenerator(makeDraft({ media: [] }));

    const result = await createPage(makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(result.media.map((item) => item.url)).toEqual([
      IMAGE_A,
      IMAGE_B,
      IMAGE_C,
    ]);
  });

  it('sends temperature 0, the create system prompt and a schema name', async () => {
    const { generate, calls } = staticGenerator(makeDraft());

    await createPage(makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(calls[0]?.temperature).toBe(0);
    expect(calls[0]?.system).toBe(CREATE_SYSTEM_PROMPT);
    expect(calls[0]?.schemaName).toBe('create_page');
  });

  it('repairs an invalid output and then succeeds', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { not: 'a draft' } }
          : { object: makeDraft() },
      ),
    );

    const result = await createPage(makeEntry(), {
      generate,
      model: testModel(),
      context: makeContext(),
    });

    expect(result.slug).toBe('pixel-navigator');
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('throws an AgentError when every attempt is invalid', async () => {
    const { generate } = staticGenerator({ not: 'a draft' });

    await expect(
      createPage(makeEntry(), {
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

describe.skipIf(!runIntegration || !hasApiKey)('create integration', () => {
  it(
    'generates a valid page for a real post',
    async () => {
      const entry = await loadEntry(
        'https://www.reddit.com/r/AynThor/comments/1wfm4hc/its_amazing_how_every_rom_can_be_so_diverse_also/',
      );

      const result = await createPage(entry);

      expect(result.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(result.draft.title.length).toBeGreaterThan(0);
      expect(result.draft.description.length).toBeGreaterThan(0);
      expect(result.draft.sections.length).toBeGreaterThan(0);
      expect(result.markdown).toContain('## Description');
      expect(result.markdown).toContain('## Setup guide');
      expect(result.markdown).not.toContain('/releases/tag/');
    },
    120000,
  );
});
