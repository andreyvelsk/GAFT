import { describe, expect, it } from 'vitest';

import { resolveModel } from '../../model';
import {
  createProvider,
  type GenerateObjectLike,
  type GenerateObjectOptions,
  type GenerateObjectResultLike,
} from '../../generation';
import {
  createDecisionEngine,
  type SystemOneArgs,
  type SystemOneLike,
  type SystemOneResult,
} from '../index';

/** An injected transport that always resolves with `result` and records calls. */
function staticSystemOne(result: SystemOneResult): {
  systemOne: SystemOneLike;
  calls: SystemOneArgs[];
} {
  const calls: SystemOneArgs[] = [];
  const systemOne: SystemOneLike = (args) => {
    calls.push(args);
    return Promise.resolve(result);
  };
  return { systemOne, calls };
}

/** A generator that records its calls and always resolves with `object`. */
function staticGenerator(object: unknown): {
  generate: GenerateObjectLike;
  calls: GenerateObjectOptions[];
} {
  const calls: GenerateObjectOptions[] = [];
  const generate: GenerateObjectLike = (options) => {
    calls.push(options);
    return Promise.resolve<GenerateObjectResultLike>({ object });
  };
  return { generate, calls };
}

describe('createDecisionEngine', () => {
  it('uses the jev adapter by default', async () => {
    const { systemOne, calls } = staticSystemOne({
      model: 'typesafe/jev-1.13',
      answers: { q: { type: 'noul', noul: 0.6 } },
    });
    const port = createDecisionEngine({ systemOne });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(calls).toHaveLength(1);
    expect(result.answers.q).toEqual({ type: 'noul', noul: 0.6 });
    expect(result.model).toBe('typesafe/jev-1.13');
  });

  it('uses the jev adapter when backend is "jev"', async () => {
    const { systemOne, calls } = staticSystemOne({
      model: 'm',
      answers: { q: { type: 'noul', noul: 1 } },
    });
    const port = createDecisionEngine({ backend: 'jev', systemOne });

    await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(calls).toHaveLength(1);
  });

  it('uses the LLM adapter when backend is "llm"', async () => {
    const { generate, calls } = staticGenerator({
      answers: { q: { type: 'noul', noul: 0.4 } },
    });
    const port = createDecisionEngine({
      backend: 'llm',
      model: createProvider({ apiKey: 'test-key' })('test/model'),
      generate,
    });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(calls).toHaveLength(1);
    expect(result.model).toBe('llm');
    expect(result.answers.q).toEqual({ type: 'noul', noul: 0.4 });
  });

  it('builds the fallback LLM model from the provider when none is given', async () => {
    const { generate, calls } = staticGenerator({ answers: {} });
    const port = createDecisionEngine({
      backend: 'llm',
      provider: { apiKey: 'test-key' },
      generate,
    });

    await port.decide({ state: 'x', questions: {} });

    expect(calls[0]?.model.modelId).toBe(resolveModel('filter'));
  });

  it('forwards the jev options to the adapter', async () => {
    const { systemOne, calls } = staticSystemOne({ model: 'm', answers: {} });
    const port = createDecisionEngine({
      backend: 'jev',
      apiKey: 'secret',
      baseUrl: 'https://example.test/api',
      decisionModel: 'custom/jev',
      systemOne,
    });

    await port.decide({ state: 'x', questions: {} });

    expect(calls[0]?.model).toBe('custom/jev');
  });

  it('forwards the LLM options to the adapter', async () => {
    const { generate, calls } = staticGenerator({ answers: {} });
    const port = createDecisionEngine({
      backend: 'llm',
      model: createProvider({ apiKey: 'test-key' })('test/model'),
      generate,
      maxRepairAttempts: 3,
    });

    await port.decide({ state: 'x', questions: {} });

    expect(calls).toHaveLength(1);
  });

  it('propagates an LLM failure as an AgentError', async () => {
    const { generate } = staticGenerator({ not: 'an answers object' });
    const port = createDecisionEngine({
      backend: 'llm',
      model: createProvider({ apiKey: 'test-key' })('test/model'),
      generate,
      maxRepairAttempts: 0,
    });

    await expect(
      port.decide({ state: 'x', questions: {} }),
    ).rejects.toMatchObject({ name: 'AgentError', agent: 'decisions' });
  });
});
