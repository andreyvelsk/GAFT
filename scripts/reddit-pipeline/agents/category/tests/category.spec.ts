import type { LanguageModel } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '../../../config';
import type {
  ChoiceAnswer,
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
import type { GitHubRepo } from '../../../github/repo';
import { AgentError } from '../../../shared/lib/errors';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import {
  CATEGORY_DEFINITIONS,
  PROJECT_CATEGORIES,
} from '../../../../../lib/categories';
import {
  CATEGORY_CHOICE_INSTRUCTIONS,
  CATEGORY_SYSTEM_PROMPT,
  classifyCategory,
  createCategoryAgent,
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

/** An injected decision port that answers `category` with a scripted `choice`. */
function mockDecision(
  script: (
    state: unknown,
  ) => ChoiceAnswer | undefined | Promise<ChoiceAnswer | undefined>,
): { decision: DecisionPort; calls: DecisionRequest[] } {
  const calls: DecisionRequest[] = [];
  const decision: DecisionPort = {
    decide: async (request: DecisionRequest): Promise<DecisionResult> => {
      calls.push(request);
      const answer = await script(request.state);
      return {
        model: 'mock',
        answers: answer === undefined ? {} : { category: answer },
      };
    },
  };
  return { decision, calls };
}

/** Build a `choice` answer for the category question. */
function choice(
  value: string,
  confidence = 0.9,
): ChoiceAnswer {
  return {
    type: 'choice',
    choice: value,
    confidence,
    probabilities: { [value]: confidence },
  };
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

/** Build a repository object for the context. */
function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    owner: 'someone',
    repo: 'my-app',
    fullName: 'someone/my-app',
    htmlUrl: 'https://github.com/someone/my-app',
    description: 'A dual-screen app',
    stars: 42,
    defaultBranch: 'main',
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

describe('createCategoryAgent (jev backend)', () => {
  it('uses the default config threshold of 0.8', () => {
    expect(config.thresholds.category).toBe(0.8);
  });

  it('returns the chosen project category', async () => {
    const { decision } = mockDecision(() => choice('game'));

    const result = await createCategoryAgent({
      backend: 'jev',
      decision,
    }).classifyCategory(makeEntry());

    expect(result).toBe('game');
  });

  it('supports every project category', async () => {
    for (const category of PROJECT_CATEGORIES) {
      const { decision } = mockDecision(() => choice(category));
      const result = await createCategoryAgent({
        backend: 'jev',
        decision,
      }).classifyCategory(makeEntry());
      expect(result).toBe(category);
    }
  });

  it('falls back to app and warns on an unknown choice', async () => {
    const { decision } = mockDecision(() => choice('page'));
    const { logger, warns } = collectingLogger();

    const result = await createCategoryAgent({
      backend: 'jev',
      decision,
      logger,
    }).classifyCategory(makeEntry());

    expect(result).toBe('app');
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({ choice: 'page', fallback: 'app' });
  });

  it('falls back to app and warns on a non-choice answer', async () => {
    const { decision } = mockDecision(() => undefined);
    const { logger, warns } = collectingLogger();

    const result = await createCategoryAgent({
      backend: 'jev',
      decision,
      logger,
    }).classifyCategory(makeEntry());

    expect(result).toBe('app');
    expect(warns).toHaveLength(1);
  });

  it('warns when confidence is below the threshold but keeps the choice', async () => {
    const { decision } = mockDecision(() => choice('emulator', 0.5));
    const { logger, warns } = collectingLogger();

    const result = await createCategoryAgent({
      backend: 'jev',
      decision,
      logger,
    }).classifyCategory(makeEntry());

    expect(result).toBe('emulator');
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({
      choice: 'emulator',
      confidence: 0.5,
      threshold: 0.8,
    });
  });

  it('does not warn when confidence meets the threshold', async () => {
    const { decision } = mockDecision(() => choice('tool', 0.8));
    const { logger, warns } = collectingLogger();

    const result = await createCategoryAgent({
      backend: 'jev',
      decision,
      logger,
    }).classifyCategory(makeEntry());

    expect(result).toBe('tool');
    expect(warns).toHaveLength(0);
  });

  it('honours an explicit threshold', async () => {
    const { decision } = mockDecision(() => choice('companion', 0.6));
    const { logger, warns } = collectingLogger();

    await createCategoryAgent({
      backend: 'jev',
      decision,
      threshold: 0.5,
      logger,
    }).classifyCategory(makeEntry());

    expect(warns).toHaveLength(0);
  });

  it('falls back to app and warns when the port throws', async () => {
    const decision: DecisionPort = {
      decide: (): Promise<DecisionResult> => Promise.reject(new Error('boom')),
    };
    const { logger, warns } = collectingLogger();

    const result = await createCategoryAgent({
      backend: 'jev',
      decision,
      logger,
    }).classifyCategory(makeEntry());

    expect(result).toBe('app');
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({ error: 'boom', fallback: 'app' });
  });

  it('sends the post, repo and readme in the state (truncated)', async () => {
    const { decision, calls } = mockDecision(() => choice('game'));
    const longText = 'x'.repeat(2000);
    const longReadme = 'y'.repeat(5000);

    await createCategoryAgent({ backend: 'jev', decision }).classifyCategory(
      makeEntry({
        id: 'p1',
        title: 'A title',
        selftext: longText,
        external_url: 'https://example.com',
        flair: 'Release',
      }),
      { repo: makeRepo(), readme: longReadme },
    );

    expect(calls).toHaveLength(1);
    expect(calls[0]?.state).toEqual({
      post: {
        id: 'p1',
        title: 'A title',
        selftext: `${'x'.repeat(799)}…`,
        external_url: 'https://example.com',
        flair: 'Release',
      },
      repo: {
        fullName: 'someone/my-app',
        description: 'A dual-screen app',
      },
      readme: `${'y'.repeat(1999)}…`,
    });
  });

  it('sends null repo and readme when the context is omitted', async () => {
    const { decision, calls } = mockDecision(() => choice('app'));

    await createCategoryAgent({ backend: 'jev', decision }).classifyCategory(
      makeEntry(),
    );

    expect(calls[0]?.state).toEqual({
      post: {
        id: 'abc123',
        title: 'My dual screen app',
        selftext: '',
        external_url: '',
        flair: '',
      },
      repo: null,
      readme: null,
    });
  });

  it('sends a choice question with the five project categories and no page', async () => {
    const { decision, calls } = mockDecision(() => choice('game'));
    const expectedCriteria = Object.fromEntries(
      PROJECT_CATEGORIES.map((category) => [
        category,
        CATEGORY_DEFINITIONS[category],
      ]),
    );

    await createCategoryAgent({ backend: 'jev', decision }).classifyCategory(
      makeEntry(),
    );

    expect(calls[0]?.questions.category).toEqual({
      type: 'choice',
      instructions: CATEGORY_CHOICE_INSTRUCTIONS,
      criteria: expectedCriteria,
    });
    expect(Object.keys(expectedCriteria)).toHaveLength(5);
    expect(Object.keys(expectedCriteria)).not.toContain('page');
  });
});

describe('createCategoryAgent (llm backend)', () => {
  it('returns the category from the model response', async () => {
    const { generate } = staticGenerator({ category: 'emulator' });

    const result = await createCategoryAgent({
      backend: 'llm',
      generate,
      model: testModel(),
    }).classifyCategory(makeEntry());

    expect(result).toBe('emulator');
  });

  it('sends temperature 0, the category system prompt and a schema name', async () => {
    const { generate, calls } = staticGenerator({ category: 'game' });

    await createCategoryAgent({
      backend: 'llm',
      generate,
      model: testModel(),
    }).classifyCategory(makeEntry({ id: 'p1' }));

    expect(calls[0]?.temperature).toBe(0);
    expect(calls[0]?.system).toBe(CATEGORY_SYSTEM_PROMPT);
    expect(calls[0]?.schemaName).toBe('category_decision');
  });

  it('repairs an invalid output and then succeeds', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { category: 'not-a-category' } }
          : { object: { category: 'tool' } },
      ),
    );

    const result = await createCategoryAgent({
      backend: 'llm',
      generate,
      model: testModel(),
    }).classifyCategory(makeEntry());

    expect(result).toBe('tool');
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('throws an AgentError when every attempt is invalid', async () => {
    const { generate } = staticGenerator({ category: 'nope' });

    await expect(
      createCategoryAgent({
        backend: 'llm',
        generate,
        model: testModel(),
        maxRepairAttempts: 0,
      }).classifyCategory(makeEntry()),
    ).rejects.toBeInstanceOf(AgentError);
  });
});

describe('classifyCategory (llm parity)', () => {
  it('is at parity with the factory llm backend (same prompt, temp, schema)', async () => {
    const entry = makeEntry({ id: 'p1', title: 'A doom port' });
    const payload = { category: 'emulator' };

    const factory = staticGenerator(payload);
    const factoryResult = await createCategoryAgent({
      backend: 'llm',
      generate: factory.generate,
      model: testModel(),
    }).classifyCategory(entry);

    const free = staticGenerator(payload);
    const freeResult = await classifyCategory(entry, {
      generate: free.generate,
      model: testModel(),
    });

    expect(factoryResult).toBe(freeResult);
    expect(factoryResult).toBe('emulator');
    expect(factory.calls).toHaveLength(1);
    expect(free.calls).toHaveLength(1);
    expect(factory.calls[0]?.prompt).toBe(free.calls[0]?.prompt);
    expect(factory.calls[0]?.system).toBe(CATEGORY_SYSTEM_PROMPT);
    expect(factory.calls[0]?.temperature).toBe(0);
  });
});

describe('createCategoryAgent (jev default adapter)', () => {
  beforeEach(() => {
    sdkState.constructorCalls.length = 0;
    sdkState.systemOneCalls.length = 0;
    sdkState.response.value = undefined;
  });

  it('creates a Jev adapter when backend is jev without an injected port', async () => {
    sdkState.response.value = {
      model: 'typesafe/jev-1.13',
      answers: {
        category: {
          type: 'choice',
          choice: 'game',
          confidence: 0.9,
          probabilities: { game: 0.9 },
        },
      },
    };

    const result = await createCategoryAgent({
      backend: 'jev',
    }).classifyCategory(makeEntry({ id: 'p1' }));

    expect(result).toBe('game');
    expect(sdkState.systemOneCalls).toHaveLength(1);
    expect(sdkState.systemOneCalls[0]?.state).toMatchObject({
      post: { id: 'p1' },
      repo: null,
      readme: null,
    });
  });
});
