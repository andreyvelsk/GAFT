import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';

import { AgentError } from '../../../shared/lib/errors';
import type { ModelUsage } from '../../../shared/lib/types';
import {
  REPAIR_INSTRUCTION,
  createProvider,
  type GenerateObjectLike,
  type GenerateObjectOptions,
  type GenerateObjectResultLike,
} from '../../generation';
import {
  LLM_DECISION_SYSTEM_PROMPT,
  buildLlmDecisionPrompt,
  createLlmDecisionAdapter,
  llmDecisionResponseSchema,
} from '../index';

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

describe('buildLlmDecisionPrompt', () => {
  it('embeds the serialized state and questions', () => {
    const prompt = buildLlmDecisionPrompt({
      state: { title: 'A post' },
      questions: { q: { type: 'noul', instructions: 'Is it relevant?' } },
    });

    expect(prompt).toContain('"title": "A post"');
    expect(prompt).toContain('"Is it relevant?"');
  });
});

describe('createLlmDecisionAdapter', () => {
  it('maps noul, choice and score answers', async () => {
    const { generate } = staticGenerator({
      answers: {
        relevant: { type: 'noul', noul: 0.9 },
        pick: {
          type: 'choice',
          choice: 'a',
          confidence: 0.8,
          probabilities: { a: 0.8, b: 0.2 },
        },
        rate: {
          type: 'score',
          score: 3,
          confidence: 0.7,
          probabilities: { 3: 0.7 },
        },
      },
    });
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    const result = await port.decide({
      state: 'a post',
      questions: {
        relevant: { type: 'noul', instructions: 'Relevant?' },
        pick: {
          type: 'choice',
          instructions: 'Pick one',
          criteria: { a: 'A', b: 'B' },
        },
        rate: { type: 'score', instructions: 'Rate it', criteria: ['low', 'high'] },
      },
    });

    expect(result.answers.relevant).toEqual({ type: 'noul', noul: 0.9 });
    expect(result.answers.pick).toEqual({
      type: 'choice',
      choice: 'a',
      confidence: 0.8,
      probabilities: { a: 0.8, b: 0.2 },
    });
    expect(result.answers.rate).toEqual({
      type: 'score',
      score: 3,
      confidence: 0.7,
      probabilities: { 3: 0.7 },
    });
  });

  it('returns the "llm" model marker and no usage', async () => {
    const { generate } = staticGenerator({
      answers: { q: { type: 'noul', noul: 1 } },
    });
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(result.model).toBe('llm');
    expect(result.usage).toBeUndefined();
  });

  it('returns the token usage and forwards it to onUsage', async () => {
    const { generate } = recordingGenerator(() =>
      Promise.resolve({
        object: { answers: { q: { type: 'noul', noul: 1 } } },
        usage: { promptTokens: 20, completionTokens: 4 },
      }),
    );
    const reported: ModelUsage[] = [];
    const port = createLlmDecisionAdapter({
      model: testModel(),
      generate,
      onUsage: (usage): void => {
        reported.push(usage);
      },
    });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 4 });
    expect(reported).toEqual([{ inputTokens: 20, outputTokens: 4 }]);
  });

  it('sends temperature 0, the system prompt and the response schema', async () => {
    const { generate, calls } = staticGenerator({ answers: {} });
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    await port.decide({ state: 'x', questions: {} });

    expect(calls[0]?.temperature).toBe(0);
    expect(calls[0]?.system).toBe(LLM_DECISION_SYSTEM_PROMPT);
    expect(calls[0]?.schema).toBe(llmDecisionResponseSchema);
    expect(calls[0]?.schemaName).toBe('decision_answers');
  });

  it('answers multiple questions in a single request', async () => {
    const { generate, calls } = staticGenerator({
      answers: {
        a: { type: 'noul', noul: 1 },
        b: {
          type: 'choice',
          choice: 'x',
          confidence: 1,
          probabilities: { x: 1, y: 0 },
        },
      },
    });
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    const result = await port.decide({
      state: 's',
      questions: {
        a: { type: 'noul', instructions: 'A?' },
        b: { type: 'choice', instructions: 'B?', criteria: { x: 'X', y: 'Y' } },
      },
    });

    expect(Object.keys(result.answers)).toEqual(['a', 'b']);
    expect(calls).toHaveLength(1);
  });

  it('repairs an invalid output and then succeeds', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { not: 'an answers object' } }
          : { object: { answers: { q: { type: 'noul', noul: 1 } } } },
      ),
    );
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(result.answers.q).toEqual({ type: 'noul', noul: 1 });
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('repairs an out-of-range answer and then succeeds', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(
        index === 0
          ? { object: { answers: { q: { type: 'noul', noul: 2 } } } }
          : { object: { answers: { q: { type: 'noul', noul: 0.5 } } } },
      ),
    );
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(result.answers.q).toEqual({ type: 'noul', noul: 0.5 });
    expect(calls).toHaveLength(2);
  });

  it('throws an AgentError once the repair attempts are exhausted', async () => {
    const { generate, calls } = staticGenerator({ not: 'an answers object' });
    const port = createLlmDecisionAdapter({ model: testModel(), generate });

    await expect(
      port.decide({ state: 'x', questions: {} }),
    ).rejects.toMatchObject({ name: 'AgentError', agent: 'decisions' });

    expect(calls).toHaveLength(2);
  });

  it('makes a single attempt when repairs are disabled', async () => {
    const { generate, calls } = staticGenerator({ not: 'an answers object' });
    const port = createLlmDecisionAdapter({
      model: testModel(),
      generate,
      maxRepairAttempts: 0,
    });

    await expect(
      port.decide({ state: 'x', questions: {} }),
    ).rejects.toBeInstanceOf(AgentError);

    expect(calls).toHaveLength(1);
  });

  it('rejects an answer that does not match any known shape', async () => {
    const { generate } = staticGenerator({
      answers: { q: { type: 'unknown' } },
    });
    const port = createLlmDecisionAdapter({
      model: testModel(),
      generate,
      maxRepairAttempts: 0,
    });

    await expect(
      port.decide({
        state: 'x',
        questions: { q: { type: 'noul', instructions: 'Q?' } },
      }),
    ).rejects.toBeInstanceOf(AgentError);
  });
});
