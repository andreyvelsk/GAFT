import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';

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
} from '../../../engines/generation';
import type { ContentCandidate } from '../../../tools/content-search';
import {
  MATCH_SYSTEM_PROMPT,
  buildMatchPrompt,
  findCandidates,
  matchPost,
  reconcileDecision,
  type MatchDecision,
} from '../index';

/** Build a report entry from a base payload plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'abc123',
    title: 'My dual screen app',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/abc123/',
    selftext: '',
    external_url: '',
    flair: '',
    images: [],
    ...overrides,
  };
}

/** Build a content candidate with sensible defaults plus overrides. */
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

/** The Pixel Navigator candidate, reused across the tests. */
const PIXEL_NAVIGATOR = candidate({
  slug: 'pixel-navigator',
  title: 'Pixel Navigator',
  description: 'Android map companion',
  projectUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
});

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

describe('buildMatchPrompt', () => {
  it('includes the post id and the candidate slugs', () => {
    const prompt = buildMatchPrompt(makeEntry({ id: 'p1' }), [PIXEL_NAVIGATOR]);

    expect(prompt).toContain('"p1"');
    expect(prompt).toContain('"pixel-navigator"');
  });

  it('renders an empty candidate list when there are no candidates', () => {
    const prompt = buildMatchPrompt(makeEntry(), []);

    expect(prompt).toContain('Existing content candidates (may be empty):');
    expect(prompt).toContain('[]');
  });

  it('truncates a very long selftext', () => {
    const long = 'x'.repeat(2000);
    const prompt = buildMatchPrompt(makeEntry({ selftext: long }), []);

    expect(prompt).not.toContain(long);
    expect(prompt).toContain('…');
  });
});

describe('reconcileDecision', () => {
  it('keeps an UPDATE whose slug matches a candidate', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'same project',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision)).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'same project',
    });
  });

  it('normalizes the requested slug to kebab-case before matching', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'Pixel Navigator',
      reason: 'same project',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision).slug).toBe(
      'pixel-navigator',
    );
  });

  it('uses the only candidate when the UPDATE slug is unknown', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'wrong-slug',
      reason: 'same project',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision)).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'same project',
    });
  });

  it('downgrades an ambiguous UPDATE to CREATE', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'wrong-slug',
      reason: 'unsure',
    };
    const candidates = [
      PIXEL_NAVIGATOR,
      candidate({ slug: 'zomboidds', title: 'ZomboidDS' }),
    ];

    expect(reconcileDecision(makeEntry(), candidates, decision)).toEqual({
      action: 'CREATE',
      slug: 'wrong-slug',
      reason: 'unsure',
    });
  });

  it('downgrades an UPDATE with no candidates to CREATE', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'unsure',
    };

    expect(reconcileDecision(makeEntry(), [], decision)).toEqual({
      action: 'CREATE',
      slug: 'pixel-navigator',
      reason: 'unsure',
    });
  });

  it('normalizes a CREATE slug to kebab-case', () => {
    const decision: MatchDecision = {
      action: 'CREATE',
      slug: 'Thor Widgets!',
      reason: 'new project',
    };

    expect(reconcileDecision(makeEntry(), [], decision)).toEqual({
      action: 'CREATE',
      slug: 'thor-widgets',
      reason: 'new project',
    });
  });

  it('derives the CREATE slug from the title when the slug is empty', () => {
    const decision: MatchDecision = {
      action: 'CREATE',
      slug: '',
      reason: 'new project',
    };

    expect(
      reconcileDecision(makeEntry({ title: 'Thor Widgets' }), [], decision).slug,
    ).toBe('thor-widgets');
  });

  it('downgrades a CREATE whose slug already exists to UPDATE', () => {
    const decision: MatchDecision = {
      action: 'CREATE',
      slug: 'pixel-navigator',
      reason: 'new project',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision)).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'new project',
    });
  });
});

describe('findCandidates', () => {
  it('merges matches by title and by external URL, de-duplicated by slug', async () => {
    const entry = makeEntry({
      title: 'Pixel Navigator update',
      external_url: 'https://github.com/ChimeraGaming/PixelNavigator',
    });

    const candidates = await findCandidates(entry, {
      index: [PIXEL_NAVIGATOR],
    });

    expect(candidates.map((item) => item.slug)).toEqual(['pixel-navigator']);
  });

  it('finds a candidate mentioned only in the selftext', async () => {
    const entry = makeEntry({
      title: 'It’s amazing how every ROM can be so diverse…',
      selftext:
        'App: https://github.com/ChimeraGaming/PixelNavigator — Pixel Navigator is still in beta.',
    });

    const candidates = await findCandidates(entry, {
      index: [PIXEL_NAVIGATOR],
    });

    expect(candidates.map((item) => item.slug)).toEqual(['pixel-navigator']);
  });

  it('returns an empty list when nothing matches', async () => {
    const entry = makeEntry({ title: 'Brand New Thing' });

    const candidates = await findCandidates(entry, {
      index: [PIXEL_NAVIGATOR],
    });

    expect(candidates).toEqual([]);
  });
});

describe('matchPost', () => {
  it('returns CREATE for a new project', async () => {
    const entry = makeEntry({ title: 'Thor Widgets' });
    const { generate } = staticGenerator({
      action: 'CREATE',
      slug: 'thor-widgets',
      reason: 'new project',
    });

    const decision = await matchPost(entry, {
      generate,
      model: testModel(),
      index: [],
    });

    expect(decision).toEqual({
      action: 'CREATE',
      slug: 'thor-widgets',
      reason: 'new project',
    });
  });

  it('returns UPDATE for an existing project', async () => {
    const entry = makeEntry({
      title: 'Pixel Navigator update',
      external_url: 'https://github.com/ChimeraGaming/PixelNavigator',
    });
    const { generate } = staticGenerator({
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'same project',
    });

    const decision = await matchPost(entry, {
      generate,
      model: testModel(),
      index: [PIXEL_NAVIGATOR],
    });

    expect(decision).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'same project',
    });
  });

  it('sends temperature 0, the match system prompt and a schema name', async () => {
    const { generate, calls } = staticGenerator({
      action: 'CREATE',
      slug: 'x',
      reason: 'r',
    });

    await matchPost(makeEntry(), { generate, model: testModel(), index: [] });

    expect(calls[0]?.temperature).toBe(0);
    expect(calls[0]?.system).toBe(MATCH_SYSTEM_PROMPT);
    expect(calls[0]?.schemaName).toBe('match_decision');
  });

  it('passes the deterministic candidates into the prompt', async () => {
    const { generate, calls } = staticGenerator({
      action: 'UPDATE',
      slug: 'pixel-navigator',
      reason: 'r',
    });

    await matchPost(makeEntry({ title: 'Pixel Navigator' }), {
      generate,
      model: testModel(),
      index: [PIXEL_NAVIGATOR],
    });

    expect(calls[0]?.prompt).toContain('"pixel-navigator"');
  });

  it('repairs an invalid output and then succeeds', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { not: 'a decision' } }
          : {
              object: {
                action: 'CREATE',
                slug: 'thor-widgets',
                reason: 'new project',
              },
            },
      ),
    );

    const decision = await matchPost(makeEntry(), {
      generate,
      model: testModel(),
      index: [],
    });

    expect(decision.action).toBe('CREATE');
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('throws an AgentError when every attempt is invalid', async () => {
    const { generate } = staticGenerator({ not: 'a decision' });

    await expect(
      matchPost(makeEntry(), {
        generate,
        model: testModel(),
        index: [],
        maxRepairAttempts: 0,
      }),
    ).rejects.toBeInstanceOf(AgentError);
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';
const hasApiKey = (process.env.OPENROUTER_API_KEY ?? '') !== '';

describe.skipIf(!runIntegration || !hasApiKey)('match integration', () => {
  it(
    'decides UPDATE for a real post about an existing project',
    async () => {
      const entry = await loadEntry(
        'https://www.reddit.com/r/AynThor/comments/1wfm4hc/its_amazing_how_every_rom_can_be_so_diverse_also/',
      );

      const decision = await matchPost(entry);

      expect(decision.action).toBe('UPDATE');
      expect(decision.slug).toBe('pixel-navigator');
    },
    60000,
  );

  it(
    'decides CREATE for a post about a new project',
    async () => {
      const entry = makeEntry({
        id: 'newproj',
        title: 'I built ThorWidgets, a dual-screen widget toolkit',
        selftext: 'Source: https://github.com/example/thor-widgets',
        external_url: 'https://github.com/example/thor-widgets',
      });

      const decision = await matchPost(entry);

      expect(decision.action).toBe('CREATE');
      expect(decision.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    },
    60000,
  );
});
