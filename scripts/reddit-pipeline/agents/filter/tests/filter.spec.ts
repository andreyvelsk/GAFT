import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';

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
  FILTER_SYSTEM_PROMPT,
  buildFilterPrompt,
  classifyBatch,
  classifyPosts,
  reconcileVerdicts,
  type FilterVerdict,
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

describe('buildFilterPrompt', () => {
  it('includes every post id and preserves the input order', () => {
    const entries = [
      makeEntry({ id: 'one', title: 'First' }),
      makeEntry({ id: 'two', title: 'Second' }),
    ];

    const prompt = buildFilterPrompt(entries);

    expect(prompt.indexOf('"one"')).toBeLessThan(prompt.indexOf('"two"'));
  });

  it('truncates a very long selftext', () => {
    const long = 'x'.repeat(2000);
    const prompt = buildFilterPrompt([makeEntry({ selftext: long })]);

    expect(prompt).not.toContain(long);
    expect(prompt).toContain('…');
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
