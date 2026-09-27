import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { AgentError } from '../../../shared/lib/errors';
import { resolveModel } from '../../model';
import {
  REPAIR_INSTRUCTION,
  buildProviderSettings,
  createProvider,
  generateStructured,
  type GenerateObjectLike,
  type GenerateObjectOptions,
  type GenerateObjectResultLike,
} from '../index';

/** A tiny schema matching the `{ ok: boolean }` payload used by most tests. */
const okSchema = z.object({ ok: z.boolean() });

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
  handler: (options: GenerateObjectOptions, index: number) => Promise<GenerateObjectResultLike>,
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

describe('buildProviderSettings', () => {
  it('defaults to the strict compatibility mode', () => {
    const settings = buildProviderSettings({ apiKey: 'k' });

    expect(settings.compatibility).toBe('strict');
  });

  it('passes the API key and base URL through', () => {
    const settings = buildProviderSettings({
      apiKey: 'secret',
      baseUrl: 'https://proxy.test/api/v1',
    });

    expect(settings.apiKey).toBe('secret');
    expect(settings.baseURL).toBe('https://proxy.test/api/v1');
  });

  it('omits the API key when it is blank', () => {
    const settings = buildProviderSettings({ apiKey: '' });

    expect(settings.apiKey).toBeUndefined();
  });

  it('omits the base URL when it is blank', () => {
    const settings = buildProviderSettings({ apiKey: 'k', baseUrl: '' });

    expect(settings.baseURL).toBeUndefined();
  });

  it('honours a custom compatibility mode', () => {
    const settings = buildProviderSettings({
      apiKey: 'k',
      compatibility: 'compatible',
    });

    expect(settings.compatibility).toBe('compatible');
  });

  it('forwards custom headers and fetch', () => {
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(new Response('{}', { status: 200 }));
    const settings = buildProviderSettings({
      apiKey: 'k',
      headers: { 'X-Test': '1' },
      fetch: fetchImpl,
    });

    expect(settings.headers).toEqual({ 'X-Test': '1' });
    expect(settings.fetch).toBe(fetchImpl);
  });
});

describe('createProvider', () => {
  it('builds a provider that creates language models', () => {
    const provider = createProvider({ apiKey: 'test-key' });
    const model = provider('test/model');

    expect(model.modelId).toBe('test/model');
    expect(model.provider).toContain('openrouter');
  });

  it('uses the configured base URL', () => {
    const provider = createProvider({
      apiKey: 'test-key',
      baseUrl: 'https://proxy.test/api/v1',
    });
    const model = provider('test/model');

    expect(model.modelId).toBe('test/model');
  });
});

describe('generateStructured', () => {
  it('returns the validated object on the first attempt', async () => {
    const { generate, calls } = staticGenerator({ ok: true });

    const result = await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'system',
      prompt: 'prompt',
      generate,
    });

    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
  });

  it('sends temperature 0, the system prompt and the user prompt', async () => {
    const { generate, calls } = staticGenerator({ ok: true });

    await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      generate,
    });

    const call = calls[0];
    expect(call?.temperature).toBe(0);
    expect(call?.system).toBe('SYS');
    expect(call?.prompt).toBe('USER');
  });

  it('honours an explicit temperature', async () => {
    const { generate, calls } = staticGenerator({ ok: true });

    await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      temperature: 0.5,
      generate,
    });

    expect(calls[0]?.temperature).toBe(0.5);
  });

  it('forwards the schema name and description', async () => {
    const { generate, calls } = staticGenerator({ ok: true });

    await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      schemaName: 'verdicts',
      schemaDescription: 'a description',
      generate,
    });

    expect(calls[0]?.schemaName).toBe('verdicts');
    expect(calls[0]?.schemaDescription).toBe('a description');
  });

  it('repairs when the raw output fails schema validation', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(index === 0 ? { object: { ok: 'nope' } } : { object: { ok: true } }),
    );

    const result = await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      generate,
    });

    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    expect(calls[1]?.prompt).toContain(REPAIR_INSTRUCTION);
  });

  it('embeds the concrete validation error in the repair prompt', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      Promise.resolve(index === 0 ? { object: { ok: 'nope' } } : { object: { ok: true } }),
    );

    await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      generate,
    });

    expect(calls[1]?.prompt).toContain('was rejected with');
    expect(calls[1]?.prompt).toContain('boolean');
  });

  it('repairs when the generator throws', async () => {
    const { generate, calls } = recordingGenerator((_options, index) =>
      index === 0
        ? Promise.reject(new Error('invalid json'))
        : Promise.resolve({ object: { ok: true } }),
    );

    const result = await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      generate,
    });

    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
  });

  it('calls onRepair with the zero-based attempt index', async () => {
    const attempts: number[] = [];
    const { generate } = recordingGenerator((_options, index) =>
      Promise.resolve(index === 0 ? { object: { ok: 'no' } } : { object: { ok: true } }),
    );

    await generateStructured({
      model: testModel(),
      schema: okSchema,
      system: 'SYS',
      prompt: 'USER',
      generate,
      onRepair: (_error, attempt) => {
        attempts.push(attempt);
      },
    });

    expect(attempts).toEqual([0]);
  });

  it('throws an AgentError once the repair attempts are exhausted', async () => {
    const { generate, calls } = staticGenerator({ ok: 'nope' });

    await expect(
      generateStructured({
        model: testModel(),
        schema: okSchema,
        system: 'SYS',
        prompt: 'USER',
        agent: 'filter',
        generate,
      }),
    ).rejects.toBeInstanceOf(AgentError);

    expect(calls).toHaveLength(2);
  });

  it('makes a single attempt when repairs are disabled', async () => {
    const { generate, calls } = staticGenerator({ ok: 'nope' });

    await expect(
      generateStructured({
        model: testModel(),
        schema: okSchema,
        system: 'SYS',
        prompt: 'USER',
        maxRepairAttempts: 0,
        generate,
      }),
    ).rejects.toThrow();

    expect(calls).toHaveLength(1);
  });

  it('includes the agent name in the failure message', async () => {
    const { generate } = staticGenerator({ ok: 'nope' });

    await expect(
      generateStructured({
        model: testModel(),
        schema: okSchema,
        system: 'SYS',
        prompt: 'USER',
        agent: 'filter',
        maxRepairAttempts: 0,
        generate,
      }),
    ).rejects.toThrow(/"filter"/);
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';
const hasApiKey = (process.env.OPENROUTER_API_KEY ?? '') !== '';

describe.skipIf(!runIntegration || !hasApiKey)('provider integration', () => {
  it(
    'generates a structured object via OpenRouter',
    async () => {
      const result = await generateStructured({
        model: createProvider()(resolveModel('filter')),
        schema: z.object({ pong: z.boolean() }),
        system: 'You are a test helper. Reply with JSON only.',
        prompt: 'Return {"pong": true}.',
      });

      expect(typeof result.pong).toBe('boolean');
    },
    60000,
  );
});
