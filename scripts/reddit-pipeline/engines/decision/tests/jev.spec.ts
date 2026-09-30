import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '../../../config';
import { AgentError } from '../../../shared/lib/errors';
import {
  DEFAULT_DECISIONS_BASE_URL,
  DEFAULT_DECISIONS_MODEL,
} from '../lib/helpers';
import {
  createJevAdapter,
  type SystemOneArgs,
  type SystemOneLike,
  type SystemOneResult,
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

beforeEach(() => {
  sdkState.constructorCalls.length = 0;
  sdkState.systemOneCalls.length = 0;
  sdkState.response.value = undefined;
});

describe('createJevAdapter', () => {
  it('maps a systemOne result into a decision result', async () => {
    const { systemOne, calls } = staticSystemOne({
      model: 'typesafe/jev-1.13',
      answers: { q: { type: 'noul', noul: 0.7 } },
      usage: { input_tokens: 12, output_tokens: 3, cost: 0.002 },
    });
    const port = createJevAdapter({ systemOne });

    const result = await port.decide({
      state: 'a post',
      questions: { q: { type: 'noul', instructions: 'Is it relevant?' } },
    });

    expect(result.model).toBe('typesafe/jev-1.13');
    expect(result.answers.q).toEqual({ type: 'noul', noul: 0.7 });
    expect(result.usage).toEqual({
      inputTokens: 12,
      outputTokens: 3,
      cost: 0.002,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe(DEFAULT_DECISIONS_MODEL);
    expect(calls[0]?.state).toBe('a post');
  });

  it('defaults the missing usage counters to zero', async () => {
    const { systemOne } = staticSystemOne({
      model: 'm',
      answers: { q: { type: 'noul', noul: 1 } },
      usage: { input_tokens: 4 },
    });
    const port = createJevAdapter({ systemOne });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(result.usage).toEqual({
      inputTokens: 4,
      outputTokens: 0,
      cost: 0,
    });
  });

  it('omits usage when the transport reports none', async () => {
    const { systemOne } = staticSystemOne({
      model: 'm',
      answers: { q: { type: 'noul', noul: 0.2 } },
    });
    const port = createJevAdapter({ systemOne });

    const result = await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(result.usage).toBeUndefined();
  });

  it('maps choice and score answers', async () => {
    const { systemOne } = staticSystemOne({
      model: 'm',
      answers: {
        pick: {
          type: 'choice',
          choice: 'a',
          confidence: 0.9,
          probabilities: { a: 0.9, b: 0.1 },
        },
        rate: {
          type: 'score',
          score: 3,
          confidence: 0.8,
          probabilities: { 3: 0.8 },
          legend: { 3: 'medium' },
        },
      },
    });
    const port = createJevAdapter({ systemOne });

    const result = await port.decide({
      state: {},
      questions: {
        pick: {
          type: 'choice',
          instructions: 'Pick one',
          criteria: { a: 'Choice A', b: 'Choice B' },
        },
        rate: {
          type: 'score',
          instructions: 'Rate it',
          criteria: ['low', 'high'],
        },
      },
    });

    expect(result.answers.pick).toEqual({
      type: 'choice',
      choice: 'a',
      confidence: 0.9,
      probabilities: { a: 0.9, b: 0.1 },
    });
    expect(result.answers.rate).toEqual({
      type: 'score',
      score: 3,
      confidence: 0.8,
      probabilities: { 3: 0.8 },
      legend: { 3: 'medium' },
    });
  });

  it('answers multiple questions in a single request', async () => {
    const { systemOne, calls } = staticSystemOne({
      model: 'm',
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
    const port = createJevAdapter({ systemOne });

    const result = await port.decide({
      state: 's',
      questions: {
        a: { type: 'noul', instructions: 'A?' },
        b: { type: 'choice', instructions: 'B?', criteria: { x: 'X', y: 'Y' } },
      },
    });

    expect(Object.keys(result.answers)).toEqual(['a', 'b']);
    expect(Object.keys(calls[0]?.questions ?? {})).toEqual(['a', 'b']);
  });

  it('forwards an object state unchanged to the transport', async () => {
    const { systemOne, calls } = staticSystemOne({ model: 'm', answers: {} });
    const port = createJevAdapter({ systemOne });
    const state = { title: 'A post', tags: ['a', 'b'] };

    await port.decide({ state, questions: {} });

    expect(calls[0]?.state).toEqual(state);
  });

  it('passes a custom model to the transport', async () => {
    const { systemOne, calls } = staticSystemOne({ model: 'm', answers: {} });
    const port = createJevAdapter({ model: 'custom/model', systemOne });

    await port.decide({ state: 'x', questions: {} });

    expect(calls[0]?.model).toBe('custom/model');
  });

  it('defaults the API key, base URL and model for the SDK client', async () => {
    sdkState.response.value = {
      model: DEFAULT_DECISIONS_MODEL,
      answers: { q: { type: 'noul', noul: 0.5 } },
      usage: { input_tokens: 1, output_tokens: 1 },
    };
    const port = createJevAdapter();

    await port.decide({
      state: 'x',
      questions: { q: { type: 'noul', instructions: 'Q?' } },
    });

    expect(sdkState.constructorCalls[0]).toEqual({
      apiKey: config.openrouter.apiKey,
      baseURL: DEFAULT_DECISIONS_BASE_URL,
    });
    expect(sdkState.systemOneCalls[0]?.model).toBe(DEFAULT_DECISIONS_MODEL);
  });

  it('forwards a custom API key and base URL to the SDK client', async () => {
    sdkState.response.value = {
      model: 'm',
      answers: {},
      usage: { input_tokens: 0, output_tokens: 0 },
    };
    const port = createJevAdapter({
      apiKey: 'secret',
      baseUrl: 'https://example.test/api',
    });

    await port.decide({ state: 'x', questions: {} });

    expect(sdkState.constructorCalls[0]).toEqual({
      apiKey: 'secret',
      baseURL: 'https://example.test/api',
    });
  });

  it('throws an AgentError on an invalid noul answer from the API', async () => {
    const { systemOne } = staticSystemOne({
      model: 'm',
      answers: { q: { type: 'noul', noul: 2 } },
    });
    const port = createJevAdapter({ systemOne });

    await expect(
      port.decide({
        state: 'x',
        questions: { q: { type: 'noul', instructions: 'Q?' } },
      }),
    ).rejects.toMatchObject({ name: 'AgentError', agent: 'decisions' });
  });

  it('throws an AgentError on an out-of-range choice confidence', async () => {
    const { systemOne } = staticSystemOne({
      model: 'm',
      answers: {
        q: {
          type: 'choice',
          choice: 'a',
          confidence: 2,
          probabilities: { a: 1 },
        },
      },
    });
    const port = createJevAdapter({ systemOne });

    await expect(
      port.decide({
        state: 'x',
        questions: {
          q: { type: 'choice', instructions: 'Q?', criteria: { a: 'A' } },
        },
      }),
    ).rejects.toBeInstanceOf(AgentError);
  });

  it('wraps a transport rejection into an AgentError', async () => {
    const systemOne: SystemOneLike = () => Promise.reject(new Error('boom'));
    const port = createJevAdapter({ systemOne });

    await expect(
      port.decide({ state: 'x', questions: {} }),
    ).rejects.toMatchObject({
      name: 'AgentError',
      agent: 'decisions',
      message: 'Jev decision failed: boom',
    });
  });
});
