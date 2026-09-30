import type { LanguageModel } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  DecisionPort,
  DecisionRequest,
  DecisionResult,
} from '../../../engines/decision';
import {
  REPAIR_INSTRUCTION,
  createProvider,
  type GenerateObjectLike,
  type GenerateObjectOptions,
  type GenerateObjectResultLike,
} from '../../../engines/generation';
import { fetchPostById, parsePostId } from '../../../reddit/client';
import { postToReport } from '../../../reddit/normalize';
import { AgentError } from '../../../shared/lib/errors';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import type { ContentCandidate } from '../../../tools/content-search';
import {
  MATCH_NEW_OPTION,
  MATCH_SYSTEM_PROMPT,
  buildMatchPrompt,
  createMatchAgent,
  findCandidates,
  matchDecisionSchema,
  matchPost,
  reconcileDecision,
  type MatchDecision,
} from '../index';

/** Shape of the client config captured from the mocked SDK constructor. */
interface ClientConfigLike {
  apiKey?: string;
  baseURL?: string;
}

/** Shape of the `systemOne` request captured from the mocked SDK client. */
interface SystemOneRequestLike {
  model?: string;
  state: unknown;
  questions: Record<string, unknown>;
}

/** Shared state for the mocked `@typesafe-ai/sdk` module. */
const sdkState = vi.hoisted(() => {
  const constructorCalls: ClientConfigLike[] = [];
  const systemOneCalls: SystemOneRequestLike[] = [];
  const response: { value: unknown } = { value: undefined };
  return { constructorCalls, systemOneCalls, response };
});

vi.mock('@typesafe-ai/sdk', () => {
  class TypeSafeClient {
    constructor(clientConfig?: ClientConfigLike) {
      sdkState.constructorCalls.push(clientConfig ?? {});
    }

    systemOne(request: SystemOneRequestLike): Promise<unknown> {
      sdkState.systemOneCalls.push(request);
      return Promise.resolve(sdkState.response.value);
    }
  }

  return { TypeSafeClient };
});

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

/** A logger that records `warn` contexts without writing to stdout. */
function collectingLogger(): {
  logger: Logger;
  warns: Record<string, unknown>[];
} {
  const warns: Record<string, unknown>[] = [];
  const logger: Logger = {
    debug: (): void => undefined,
    info: (): void => undefined,
    error: (): void => undefined,
    warn: (_message, context): void => {
      warns.push(context ?? {});
    },
    child: (): Logger => logger,
  };
  return { logger, warns };
}

/** Result scripted for a mocked decision port `match` choice. */
interface ChoiceScript {
  choice: string;
  confidence?: number;
}

/** A decision port that answers `match` with a scripted `choice`. */
function mockChoiceDecision(
  script: (state: unknown) => ChoiceScript | Promise<ChoiceScript>,
): { decision: DecisionPort; calls: DecisionRequest[] } {
  const calls: DecisionRequest[] = [];
  const decision: DecisionPort = {
    decide: async (request: DecisionRequest): Promise<DecisionResult> => {
      calls.push(request);
      const result = await script(request.state);
      return {
        model: 'mock',
        answers: {
          match: {
            type: 'choice',
            choice: result.choice,
            confidence: result.confidence ?? 1,
            probabilities: {},
          },
        },
      };
    },
  };
  return { decision, calls };
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

  it('does not truncate a very long selftext by default', () => {
    const long = 'x'.repeat(2000);
    const prompt = buildMatchPrompt(makeEntry({ selftext: long }), []);

    expect(prompt).toContain(long);
  });

  it('requests only action and slug (no reason)', () => {
    const prompt = buildMatchPrompt(makeEntry(), []);

    expect(prompt).toContain('{"action": ..., "slug": ...}');
    expect(prompt).not.toContain('reason');
    expect(MATCH_SYSTEM_PROMPT).not.toContain('reason');
  });
});

describe('matchDecisionSchema', () => {
  it('has exactly the action and slug keys', () => {
    expect(Object.keys(matchDecisionSchema.shape)).toEqual(['action', 'slug']);
  });

  it('parses a decision without a reason', () => {
    expect(matchDecisionSchema.parse({ action: 'CREATE', slug: 'x' })).toEqual({
      action: 'CREATE',
      slug: 'x',
    });
  });
});

describe('reconcileDecision', () => {
  it('keeps an UPDATE whose slug matches a candidate', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'pixel-navigator',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision)).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
    });
  });

  it('normalizes the requested slug to kebab-case before matching', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'Pixel Navigator',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision).slug).toBe(
      'pixel-navigator',
    );
  });

  it('uses the only candidate when the UPDATE slug is unknown', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'wrong-slug',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision)).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
    });
  });

  it('downgrades an ambiguous UPDATE to CREATE', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'wrong-slug',
    };
    const candidates = [
      PIXEL_NAVIGATOR,
      candidate({ slug: 'zomboidds', title: 'ZomboidDS' }),
    ];

    expect(reconcileDecision(makeEntry(), candidates, decision)).toEqual({
      action: 'CREATE',
      slug: 'wrong-slug',
    });
  });

  it('downgrades an UPDATE with no candidates to CREATE', () => {
    const decision: MatchDecision = {
      action: 'UPDATE',
      slug: 'pixel-navigator',
    };

    expect(reconcileDecision(makeEntry(), [], decision)).toEqual({
      action: 'CREATE',
      slug: 'pixel-navigator',
    });
  });

  it('normalizes a CREATE slug to kebab-case', () => {
    const decision: MatchDecision = {
      action: 'CREATE',
      slug: 'Thor Widgets!',
    };

    expect(reconcileDecision(makeEntry(), [], decision)).toEqual({
      action: 'CREATE',
      slug: 'thor-widgets',
    });
  });

  it('derives the CREATE slug from the title when the slug is empty', () => {
    const decision: MatchDecision = { action: 'CREATE', slug: '' };

    expect(
      reconcileDecision(makeEntry({ title: 'Thor Widgets' }), [], decision).slug,
    ).toBe('thor-widgets');
  });

  it('downgrades a CREATE whose slug already exists to UPDATE', () => {
    const decision: MatchDecision = {
      action: 'CREATE',
      slug: 'pixel-navigator',
    };

    expect(reconcileDecision(makeEntry(), [PIXEL_NAVIGATOR], decision)).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
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

describe('matchPost (legacy LLM wrapper)', () => {
  it('returns CREATE for a new project', async () => {
    const entry = makeEntry({ title: 'Thor Widgets' });
    const { generate } = staticGenerator({
      action: 'CREATE',
      slug: 'thor-widgets',
    });

    const decision = await matchPost(entry, {
      generate,
      model: testModel(),
      index: [],
    });

    expect(decision).toEqual({ action: 'CREATE', slug: 'thor-widgets' });
  });

  it('returns UPDATE for an existing project', async () => {
    const entry = makeEntry({
      title: 'Pixel Navigator update',
      external_url: 'https://github.com/ChimeraGaming/PixelNavigator',
    });
    const { generate } = staticGenerator({
      action: 'UPDATE',
      slug: 'pixel-navigator',
    });

    const decision = await matchPost(entry, {
      generate,
      model: testModel(),
      index: [PIXEL_NAVIGATOR],
    });

    expect(decision).toEqual({ action: 'UPDATE', slug: 'pixel-navigator' });
  });

  it('sends temperature 0, the match system prompt and a schema name', async () => {
    const { generate, calls } = staticGenerator({
      action: 'CREATE',
      slug: 'x',
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
          : { object: { action: 'CREATE', slug: 'thor-widgets' } },
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

describe('createMatchAgent (llm backend)', () => {
  it('is at parity with the legacy matchPost (same prompt, temp, schema, result)', async () => {
    const entry = makeEntry({ title: 'Pixel Navigator update' });
    const payload = { action: 'UPDATE', slug: 'pixel-navigator' };

    const { generate: factoryGenerate, calls: factoryCalls } =
      staticGenerator(payload);
    const factoryResult = await createMatchAgent({
      backend: 'llm',
      generate: factoryGenerate,
      model: testModel(),
      index: [PIXEL_NAVIGATOR],
    }).matchPost(entry);

    const { generate: freeGenerate, calls: freeCalls } = staticGenerator(payload);
    const freeResult = await matchPost(entry, {
      generate: freeGenerate,
      model: testModel(),
      index: [PIXEL_NAVIGATOR],
    });

    expect(factoryResult).toEqual(freeResult);
    expect(factoryResult).toEqual({
      action: 'UPDATE',
      slug: 'pixel-navigator',
    });
    expect(factoryCalls).toHaveLength(1);
    expect(freeCalls).toHaveLength(1);
    expect(factoryCalls[0]?.prompt).toBe(freeCalls[0]?.prompt);
    expect(factoryCalls[0]?.system).toBe(MATCH_SYSTEM_PROMPT);
    expect(factoryCalls[0]?.temperature).toBe(0);
    expect(factoryCalls[0]?.schema).toBe(freeCalls[0]?.schema);
  });

  it('lets per-call options override the agent-level options', async () => {
    const { generate, calls } = staticGenerator({
      action: 'CREATE',
      slug: 'thor-widgets',
    });

    await createMatchAgent({ backend: 'llm', index: [PIXEL_NAVIGATOR] }).matchPost(
      makeEntry({ title: 'Pixel Navigator' }),
      { generate, model: testModel(), index: [] },
    );

    // The per-call empty index wins, so no candidate reaches the prompt.
    expect(calls[0]?.prompt).toContain('[]');
  });
});

describe('createMatchAgent (jev backend)', () => {
  it('maps a candidate choice to UPDATE with that slug', async () => {
    const { decision, calls } = mockChoiceDecision(() => ({
      choice: 'pixel-navigator',
    }));

    const result = await createMatchAgent({
      backend: 'jev',
      decision,
    }).matchPost(makeEntry({ title: 'Pixel Navigator update' }), {
      index: [PIXEL_NAVIGATOR],
    });

    expect(result).toEqual({ action: 'UPDATE', slug: 'pixel-navigator' });
    expect(calls).toHaveLength(1);
  });

  it('maps the __new__ choice to CREATE with the kebab-case title', async () => {
    const { decision } = mockChoiceDecision(() => ({
      choice: MATCH_NEW_OPTION,
    }));

    const result = await createMatchAgent({
      backend: 'jev',
      decision,
    }).matchPost(makeEntry({ title: 'Thor Widgets' }), { index: [] });

    expect(result).toEqual({ action: 'CREATE', slug: 'thor-widgets' });
  });

  it('creates a new page when the candidate list is empty', async () => {
    const { decision, calls } = mockChoiceDecision(() => ({
      choice: MATCH_NEW_OPTION,
    }));

    const result = await createMatchAgent({
      backend: 'jev',
      decision,
    }).matchPost(makeEntry({ title: 'Brand New Thing' }), { index: [] });

    expect(result).toEqual({ action: 'CREATE', slug: 'brand-new-thing' });
    expect(calls[0]?.state).toMatchObject({ candidates: [] });
  });

  it('treats an unknown choice as CREATE and logs a warning', async () => {
    const { decision } = mockChoiceDecision(() => ({ choice: 'ghost' }));
    const { logger, warns } = collectingLogger();

    const result = await createMatchAgent({
      backend: 'jev',
      decision,
      logger,
    }).matchPost(makeEntry({ title: 'Thor Widgets' }), { index: [] });

    expect(result).toEqual({ action: 'CREATE', slug: 'thor-widgets' });
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({ choice: 'ghost' });
  });

  it('logs a warning below the threshold but still accepts the choice', async () => {
    const { decision } = mockChoiceDecision(() => ({
      choice: 'pixel-navigator',
      confidence: 0.5,
    }));
    const { logger, warns } = collectingLogger();

    const result = await createMatchAgent({
      backend: 'jev',
      decision,
      logger,
      threshold: 0.8,
    }).matchPost(makeEntry({ title: 'Pixel Navigator update' }), {
      index: [PIXEL_NAVIGATOR],
    });

    expect(result).toEqual({ action: 'UPDATE', slug: 'pixel-navigator' });
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({ choice: 'pixel-navigator', confidence: 0.5 });
  });

  it('does not warn when the confidence is at or above the threshold', async () => {
    const { decision } = mockChoiceDecision(() => ({
      choice: 'pixel-navigator',
      confidence: 0.9,
    }));
    const { logger, warns } = collectingLogger();

    await createMatchAgent({
      backend: 'jev',
      decision,
      logger,
      threshold: 0.8,
    }).matchPost(makeEntry({ title: 'Pixel Navigator update' }), {
      index: [PIXEL_NAVIGATOR],
    });

    expect(warns).toHaveLength(0);
  });

  it('sends the post, candidates and a choice question with criteria', async () => {
    const { decision, calls } = mockChoiceDecision(() => ({
      choice: MATCH_NEW_OPTION,
    }));

    await createMatchAgent({ backend: 'jev', decision }).matchPost(
      makeEntry({
        id: 'p1',
        title: 'Pixel Navigator update',
        selftext: 'A body',
      }),
      { index: [PIXEL_NAVIGATOR] },
    );

    expect(calls).toHaveLength(1);
    expect(calls[0]?.state).toEqual({
      post: {
        id: 'p1',
        title: 'Pixel Navigator update',
        selftext: 'A body',
        external_url: '',
        flair: '',
      },
      candidates: [
        {
          slug: 'pixel-navigator',
          title: 'Pixel Navigator',
          description: 'Android map companion',
          projectUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
        },
      ],
    });

    const question = calls[0]?.questions.match;
    expect(question?.type).toBe('choice');
    if (question?.type !== 'choice') {
      throw new Error('expected a choice question');
    }
    expect(Object.keys(question.criteria)).toEqual([
      'pixel-navigator',
      MATCH_NEW_OPTION,
    ]);
    expect(question.criteria['pixel-navigator']).toBe(
      'Pixel Navigator — Android map companion (https://github.com/ChimeraGaming/PixelNavigator)',
    );
    expect(question.criteria[MATCH_NEW_OPTION]).toBe(
      'A project that is not among the candidates',
    );
  });

  it('offers only the __new__ option when there are no candidates', async () => {
    const { decision, calls } = mockChoiceDecision(() => ({
      choice: MATCH_NEW_OPTION,
    }));

    await createMatchAgent({ backend: 'jev', decision }).matchPost(
      makeEntry({ title: 'Thor Widgets' }),
      { index: [] },
    );

    const question = calls[0]?.questions.match;
    if (question?.type !== 'choice') {
      throw new Error('expected a choice question');
    }
    expect(Object.keys(question.criteria)).toEqual([MATCH_NEW_OPTION]);
  });

  it('does not truncate a very long selftext before sending it to the port', async () => {
    const { decision, calls } = mockChoiceDecision(() => ({
      choice: MATCH_NEW_OPTION,
    }));
    const long = 'x'.repeat(2000);

    await createMatchAgent({ backend: 'jev', decision }).matchPost(
      makeEntry({ selftext: long }),
      { index: [] },
    );

    const state = JSON.stringify(calls[0]?.state);
    expect(state).toContain(long);
  });

  it('forwards the injected index to the deterministic candidate search', async () => {
    const { decision, calls } = mockChoiceDecision(() => ({
      choice: 'pixel-navigator',
    }));

    await createMatchAgent({ backend: 'jev', decision }).matchPost(
      makeEntry({ title: 'Pixel Navigator update' }),
      { index: [PIXEL_NAVIGATOR] },
    );

    const question = calls[0]?.questions.match;
    if (question?.type !== 'choice') {
      throw new Error('expected a choice question');
    }
    expect(Object.keys(question.criteria)).toContain('pixel-navigator');
  });

  it('falls back to CREATE when the decision port rejects', async () => {
    const decision: DecisionPort = {
      decide: (): Promise<DecisionResult> => Promise.reject(new Error('boom')),
    };
    const { logger, warns } = collectingLogger();

    const result = await createMatchAgent({
      backend: 'jev',
      decision,
      logger,
    }).matchPost(makeEntry({ title: 'Thor Widgets' }), { index: [] });

    expect(result).toEqual({ action: 'CREATE', slug: 'thor-widgets' });
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({ error: 'boom' });
  });
});

describe('createMatchAgent (jev default adapter)', () => {
  beforeEach(() => {
    sdkState.constructorCalls.length = 0;
    sdkState.systemOneCalls.length = 0;
    sdkState.response.value = undefined;
  });

  it('creates a Jev adapter when backend is jev without an injected port', async () => {
    sdkState.response.value = {
      model: 'typesafe/jev-1.13',
      answers: {
        match: {
          type: 'choice',
          choice: MATCH_NEW_OPTION,
          confidence: 0.9,
          probabilities: {},
        },
      },
    };

    const result = await createMatchAgent({ backend: 'jev' }).matchPost(
      makeEntry({ title: 'Thor Widgets' }),
      { index: [] },
    );

    expect(result).toEqual({ action: 'CREATE', slug: 'thor-widgets' });
    expect(sdkState.systemOneCalls).toHaveLength(1);
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
