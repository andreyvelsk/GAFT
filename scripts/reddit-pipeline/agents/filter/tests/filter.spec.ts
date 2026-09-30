import type { LanguageModel } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '../../../config';
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
import {
  FILTER_NOUL_CRITERIA,
  FILTER_SYSTEM_PROMPT,
  buildFilterPrompt,
  classifyBatch,
  classifyPosts,
  createFilterAgent,
  reconcileVerdicts,
  type FilterBatchInfo,
  type FilterVerdict,
} from '../index';
import { REAL_POST_CASES } from './fixtures/real-posts';

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

/** An injected decision port that answers `relevant` with a scripted `noul`. */
function mockDecision(script: (state: unknown) => number | Promise<number>): {
  decision: DecisionPort;
  calls: DecisionRequest[];
} {
  const calls: DecisionRequest[] = [];
  const decision: DecisionPort = {
    decide: async (request: DecisionRequest): Promise<DecisionResult> => {
      calls.push(request);
      const noul = await script(request.state);
      return { model: 'mock', answers: { relevant: { type: 'noul', noul } } };
    },
  };
  return { decision, calls };
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

describe('buildFilterPrompt', () => {
  it('includes every post id and preserves the input order', () => {
    const entries = [
      makeEntry({ id: 'one', title: 'First' }),
      makeEntry({ id: 'two', title: 'Second' }),
    ];

    const prompt = buildFilterPrompt(entries);

    expect(prompt.indexOf('"one"')).toBeLessThan(prompt.indexOf('"two"'));
  });

  it('does not truncate a very long selftext by default', () => {
    const long = 'x'.repeat(2000);
    const prompt = buildFilterPrompt([makeEntry({ selftext: long })]);

    expect(prompt).toContain(long);
  });
});

describe('reconcileVerdicts', () => {
  it('returns verdicts in the input order', () => {
    const entries = [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })];
    const verdicts: FilterVerdict[] = [
      { id: 'b', relevant: true },
      { id: 'a', relevant: false },
    ];

    expect(reconcileVerdicts(entries, verdicts)).toEqual([
      { id: 'a', relevant: false },
      { id: 'b', relevant: true },
    ]);
  });

  it('defaults a missing id to not relevant', () => {
    const entries = [makeEntry({ id: 'a' }), makeEntry({ id: 'b' })];

    expect(reconcileVerdicts(entries, [{ id: 'a', relevant: true }])).toEqual([
      { id: 'a', relevant: true },
      { id: 'b', relevant: false },
    ]);
  });

  it('ignores verdicts for unknown ids', () => {
    const entries = [makeEntry({ id: 'a' })];

    expect(
      reconcileVerdicts(entries, [
        { id: 'a', relevant: true },
        { id: 'ghost', relevant: true },
      ]),
    ).toEqual([{ id: 'a', relevant: true }]);
  });
});

describe('classifyBatch', () => {
  it('returns an empty array for no entries without calling the model', async () => {
    const { generate, calls } = staticGenerator({ verdicts: [] });

    const result = await classifyBatch([], { generate, model: testModel() });

    expect(result).toEqual([]);
    expect(calls).toHaveLength(0);
  });

  it('classifies a batch, matching length and order', async () => {
    const entries = [
      makeEntry({ id: 'p1', title: 'How do I install games?' }),
      makeEntry({ id: 'p2', title: 'I built a port of Doom' }),
      makeEntry({ id: 'p3', title: 'Shipping update' }),
    ];
    const { generate } = staticGenerator({
      verdicts: [
        { id: 'p1', relevant: false },
        { id: 'p2', relevant: true },
        { id: 'p3', relevant: false },
      ],
    });

    const result = await classifyBatch(entries, {
      generate,
      model: testModel(),
    });

    expect(result).toEqual([
      { id: 'p1', relevant: false },
      { id: 'p2', relevant: true },
      { id: 'p3', relevant: false },
    ]);
  });

  it('sends temperature 0, the filter system prompt and a schema name', async () => {
    const { generate, calls } = staticGenerator({ verdicts: [] });

    await classifyBatch([makeEntry({ id: 'p1' })], {
      generate,
      model: testModel(),
    });

    expect(calls[0]?.temperature).toBe(0);
    expect(calls[0]?.system).toBe(FILTER_SYSTEM_PROMPT);
    expect(calls[0]?.schemaName).toBe('filter_verdicts');
  });

  it('reconciles an incomplete verdict list into the input shape', async () => {
    const entries = [makeEntry({ id: 'p1' }), makeEntry({ id: 'p2' })];
    const { generate } = staticGenerator({
      verdicts: [{ id: 'p1', relevant: true }],
    });

    const result = await classifyBatch(entries, {
      generate,
      model: testModel(),
    });

    expect(result).toEqual([
      { id: 'p1', relevant: true },
      { id: 'p2', relevant: false },
    ]);
  });

  it('repairs an invalid output and then succeeds', async () => {
    const entries = [makeEntry({ id: 'p1' })];
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { not: 'a verdicts object' } }
          : { object: { verdicts: [{ id: 'p1', relevant: true }] } },
      ),
    );

    const result = await classifyBatch(entries, {
      generate,
      model: testModel(),
    });

    expect(result).toEqual([{ id: 'p1', relevant: true }]);
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('throws an AgentError when every attempt is invalid', async () => {
    const { generate } = staticGenerator({ not: 'a verdicts object' });

    await expect(
      classifyBatch([makeEntry({ id: 'p1' })], {
        generate,
        model: testModel(),
        maxRepairAttempts: 0,
      }),
    ).rejects.toBeInstanceOf(AgentError);
  });
});

describe('classifyPosts', () => {
  it('returns an empty array for no entries', async () => {
    const { generate } = staticGenerator({ verdicts: [] });

    const result = await classifyPosts([], { generate, model: testModel() });

    expect(result).toEqual([]);
  });

  it('splits the entries into batches of the configured size', async () => {
    const entries = [
      makeEntry({ id: 'p1' }),
      makeEntry({ id: 'p2' }),
      makeEntry({ id: 'p3' }),
    ];
    const { generate, calls } = recordingGenerator((options) => {
      const ids = options.prompt.match(/"id":\s*"([^"]+)"/g) ?? [];
      return Promise.resolve({
        object: {
          verdicts: ids.map((token) => ({
            id: token.replace(/"id":\s*"/, '').replace(/"$/, ''),
            relevant: true,
          })),
        },
      });
    });

    const result = await classifyPosts(entries, {
      generate,
      model: testModel(),
      batchSize: 2,
    });

    expect(calls).toHaveLength(2);
    expect(result).toHaveLength(3);
    expect(result.map((verdict) => verdict.id)).toEqual(['p1', 'p2', 'p3']);
  });
});

describe('createFilterAgent (jev backend)', () => {
  it('uses the default config threshold of 0.8', async () => {
    expect(config.thresholds.filter).toBe(0.8);
    const { decision } = mockDecision(() => 0.8);

    const result = await createFilterAgent({
      backend: 'jev',
      decision,
    }).classifyPosts([makeEntry({ id: 'p1' })]);

    expect(result).toEqual([{ id: 'p1', relevant: true, probability: 0.8 }]);
  });

  it('marks a post relevant when noul >= threshold and not relevant below', async () => {
    const values = [0.85, 0.79];
    let index = 0;
    const { decision } = mockDecision(() => values[index++] ?? 0);

    const result = await createFilterAgent({
      backend: 'jev',
      decision,
    }).classifyPosts([makeEntry({ id: 'a' }), makeEntry({ id: 'b' })]);

    expect(result).toEqual([
      { id: 'a', relevant: true, probability: 0.85 },
      { id: 'b', relevant: false, probability: 0.79 },
    ]);
  });

  it('honours an explicit threshold', async () => {
    const { decision } = mockDecision(() => 0.6);
    const lenient = createFilterAgent({
      backend: 'jev',
      decision,
      threshold: 0.5,
    });

    expect(await lenient.classifyPosts([makeEntry({ id: 'p1' })])).toEqual([
      { id: 'p1', relevant: true, probability: 0.6 },
    ]);

    const { decision: strictDecision } = mockDecision(() => 0.6);
    const strict = createFilterAgent({
      backend: 'jev',
      decision: strictDecision,
      threshold: 0.7,
    });

    expect(await strict.classifyPosts([makeEntry({ id: 'p2' })])).toEqual([
      { id: 'p2', relevant: false, probability: 0.6 },
    ]);
  });

  it('sends the post input and a noul relevance question with criteria', async () => {
    const { decision, calls } = mockDecision(() => 1);

    await createFilterAgent({ backend: 'jev', decision }).classifyPosts([
      makeEntry({ id: 'p1', title: 'A title', selftext: 'A body' }),
    ]);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.state).toEqual({
      id: 'p1',
      title: 'A title',
      selftext: 'A body',
      external_url: '',
      flair: '',
    });
    expect(calls[0]?.questions.relevant).toMatchObject({
      type: 'noul',
      criteria: FILTER_NOUL_CRITERIA,
    });
  });

  it('returns an empty array without calling the port', async () => {
    const { decision, calls } = mockDecision(() => 1);

    const result = await createFilterAgent({
      backend: 'jev',
      decision,
    }).classifyPosts([]);

    expect(result).toEqual([]);
    expect(calls).toHaveLength(0);
  });

  it('preserves the input order and length', async () => {
    const values = [0.1, 0.9, 0.5];
    let index = 0;
    const { decision } = mockDecision(() => values[index++] ?? 0);

    const result = await createFilterAgent({
      backend: 'jev',
      decision,
    }).classifyPosts([
      makeEntry({ id: 'x' }),
      makeEntry({ id: 'y' }),
      makeEntry({ id: 'z' }),
    ]);

    expect(result.map((verdict) => verdict.id)).toEqual(['x', 'y', 'z']);
    expect(result).toHaveLength(3);
  });

  it('treats a failing post as not relevant and processes the rest', async () => {
    let index = 0;
    const { decision } = mockDecision(() => {
      if (index++ === 1) {
        throw new Error('boom');
      }
      return 0.9;
    });
    const { logger, warns } = collectingLogger();

    const result = await createFilterAgent({
      backend: 'jev',
      decision,
      logger,
    }).classifyPosts([
      makeEntry({ id: 'a' }),
      makeEntry({ id: 'b' }),
      makeEntry({ id: 'c' }),
    ]);

    expect(result).toEqual([
      { id: 'a', relevant: true, probability: 0.9 },
      { id: 'b', relevant: false },
      { id: 'c', relevant: true, probability: 0.9 },
    ]);
    expect(warns).toHaveLength(1);
    expect(warns[0]).toMatchObject({ id: 'b', error: 'boom' });
  });

  it('calls the port once per post and invokes onBatch per group', async () => {
    const { decision, calls } = mockDecision(() => 1);
    const infos: FilterBatchInfo[] = [];

    const result = await createFilterAgent({
      backend: 'jev',
      decision,
    }).classifyPosts(
      [makeEntry({ id: 'a' }), makeEntry({ id: 'b' }), makeEntry({ id: 'c' })],
      {
        batchSize: 2,
        onBatch: (info) => {
          infos.push(info);
        },
      },
    );

    expect(calls).toHaveLength(3);
    expect(infos).toEqual([
      { batch: 1, totalBatches: 2, posts: 2 },
      { batch: 2, totalBatches: 2, posts: 1 },
    ]);
    expect(result).toHaveLength(3);
  });
});

describe('createFilterAgent (llm backend)', () => {
  it('splits requests according to batchSize', async () => {
    const { generate, calls } = staticGenerator({ verdicts: [] });

    await createFilterAgent({
      backend: 'llm',
      generate,
      model: testModel(),
    }).classifyPosts(
      [makeEntry({ id: 'a' }), makeEntry({ id: 'b' }), makeEntry({ id: 'c' })],
      { batchSize: 1 },
    );

    expect(calls).toHaveLength(3);
  });

  it('is at parity with the legacy classifyPosts (same prompt, temp, schema)', async () => {
    const entries = [makeEntry({ id: 'p1' }), makeEntry({ id: 'p2' })];
    const payload = {
      verdicts: [
        { id: 'p1', relevant: true },
        { id: 'p2', relevant: false },
      ],
    };

    const { generate: factoryGenerate, calls: factoryCalls } =
      staticGenerator(payload);
    const factoryResult = await createFilterAgent({
      backend: 'llm',
      generate: factoryGenerate,
      model: testModel(),
    }).classifyPosts(entries);

    const { generate: freeGenerate, calls: freeCalls } = staticGenerator(payload);
    const freeResult = await classifyPosts(entries, {
      generate: freeGenerate,
      model: testModel(),
    });

    expect(factoryResult).toEqual(freeResult);
    expect(factoryResult).toEqual([
      { id: 'p1', relevant: true },
      { id: 'p2', relevant: false },
    ]);
    expect(factoryCalls).toHaveLength(1);
    expect(freeCalls).toHaveLength(1);
    expect(factoryCalls[0]?.prompt).toBe(freeCalls[0]?.prompt);
    expect(factoryCalls[0]?.system).toBe(FILTER_SYSTEM_PROMPT);
    expect(factoryCalls[0]?.temperature).toBe(0);
    expect(factoryCalls[0]?.schema).toBe(freeCalls[0]?.schema);
  });
});

describe('createFilterAgent (jev default adapter)', () => {
  beforeEach(() => {
    sdkState.constructorCalls.length = 0;
    sdkState.systemOneCalls.length = 0;
    sdkState.response.value = undefined;
  });

  it('creates a Jev adapter when backend is jev without an injected port', async () => {
    sdkState.response.value = {
      model: 'typesafe/jev-1.13',
      answers: { relevant: { type: 'noul', noul: 0.9 } },
    };

    const result = await createFilterAgent({ backend: 'jev' }).classifyPosts([
      makeEntry({ id: 'p1' }),
    ]);

    expect(result).toEqual([{ id: 'p1', relevant: true, probability: 0.9 }]);
    expect(sdkState.systemOneCalls).toHaveLength(1);
    expect(sdkState.systemOneCalls[0]?.state).toEqual({
      id: 'p1',
      title: 'My dual screen app',
      selftext: '',
      external_url: '',
      flair: '',
    });
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';
const hasApiKey = (process.env.OPENROUTER_API_KEY ?? '') !== '';

describe.skipIf(!runIntegration || !hasApiKey)('filter integration', () => {
  it(
    'classifies a batch of real posts via OpenRouter',
    async () => {
      const entries = [
        makeEntry({
          id: 'int1',
          title: 'How do I set up emulators on the Thor?',
          selftext: 'Looking for advice, no project here.',
        }),
        makeEntry({
          id: 'int2',
          title: 'I released my dual-screen launcher',
          selftext: 'Source: https://github.com/example/launcher',
          external_url: 'https://github.com/example/launcher',
        }),
        makeEntry({
          id: 'int3',
          title: 'Shipping update #12',
          selftext: 'Orders are on the way.',
        }),
      ];

      const result = await classifyBatch(entries);

      // Structure: exactly one verdict per input post, in the input order.
      expect(result).toHaveLength(3);
      expect(result.map((verdict) => verdict.id)).toEqual(['int1', 'int2', 'int3']);

      // Semantics: the model must actually classify the posts, not just echo ids.
      const relevantById = new Map(
        result.map((verdict) => [verdict.id, verdict.relevant]),
      );
      expect(relevantById.get('int1')).toBe(false); // question, no project
      expect(relevantById.get('int2')).toBe(true); // released project + repo link
      expect(relevantById.get('int3')).toBe(false); // shipping update
    },
    60000,
  );
});

describe.skipIf(!runIntegration || !hasApiKey)(
  'filter integration (real posts)',
  () => {
    it.each(REAL_POST_CASES)(
      'classifies $url as relevant=$expected',
      async ({ url, expected }) => {
        const entry = await loadEntry(url);
        const [verdict] = await classifyBatch([entry]);

        expect(verdict?.relevant).toBe(expected);
      },
      60000,
    );
  },
);
