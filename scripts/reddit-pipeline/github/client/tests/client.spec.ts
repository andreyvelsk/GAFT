import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { GITHUB_API } from '../../../shared/lib/constants';
import { FetchError } from '../../../shared/lib/errors';
import {
  githubJson,
  githubRequest,
  githubText,
  isRetryable,
  type GitHubRequestOptions,
} from '../index';

/** A single recorded `fetch` invocation. */
interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

/** A controllable fetch implementation plus the calls it recorded. */
interface FetchRecorder {
  fetchImpl: typeof fetch;
  calls: FetchCall[];
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
  handler: (url: string, callIndex: number) => Promise<Response>,
): FetchRecorder {
  const calls: FetchCall[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = inputUrl(input);
    calls.push({ url, init });
    return await handler(url, calls.length - 1);
  };
  return { fetchImpl, calls };
}

/** Build a fetch implementation that always returns the same response. */
function staticFetch(response: Response): FetchRecorder {
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

/** Headers of the n-th recorded call as a `Headers` instance. */
function callHeaders(recorder: FetchRecorder, index = 0): Headers {
  return new Headers(recorder.calls[index]?.init?.headers);
}

/** Result of awaiting an operation without losing a rejection. */
type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown };

/**
 * Run an async operation while fake timers drive the retry delays.
 * The rejection handler is attached before advancing the timers so a failing
 * operation is never reported as an unhandled rejection.
 */
async function withFakeTimers<T>(run: () => Promise<T>): Promise<T> {
  vi.useFakeTimers();
  try {
    const settled: Promise<Settled<T>> = run().then(
      (value) => ({ ok: true, value }),
      (error: unknown) => ({ ok: false, error }),
    );
    await vi.runAllTimersAsync();
    const result = await settled;
    if (result.ok) {
      return result.value;
    }
    throw result.error instanceof Error
      ? result.error
      : new Error(String(result.error));
  } finally {
    vi.useRealTimers();
  }
}

/** Schema matching the tiny `{ ok: true }` payload used by most tests. */
const okSchema = z.object({ ok: z.boolean() });

const originalToken = process.env.GITHUB_TOKEN;

afterEach(() => {
  if (originalToken === undefined) {
    delete process.env.GITHUB_TOKEN;
  } else {
    process.env.GITHUB_TOKEN = originalToken;
  }
  vi.useRealTimers();
});

describe('isRetryable', () => {
  it('retries rate limits and server errors', () => {
    expect(isRetryable(new FetchError('x', 'u', 429))).toBe(true);
    expect(isRetryable(new FetchError('x', 'u', 500))).toBe(true);
    expect(isRetryable(new FetchError('x', 'u', 503))).toBe(true);
  });

  it('retries network errors without a status', () => {
    expect(isRetryable(new TypeError('network'))).toBe(true);
  });

  it('does not retry client errors such as 404', () => {
    expect(isRetryable(new FetchError('x', 'u', 404))).toBe(false);
    expect(isRetryable(new FetchError('x', 'u', 403))).toBe(false);
  });
});

describe('githubRequest', () => {
  it('uses the public GitHub API by default', async () => {
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('/rate_limit', okSchema, { fetchImpl: recorder.fetchImpl });

    expect(recorder.calls[0]?.url.startsWith(GITHUB_API)).toBe(true);
  });

  it('honours a custom base URL', async () => {
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('/x', okSchema, {
      baseUrl: 'https://api.test',
      fetchImpl: recorder.fetchImpl,
    });

    expect(recorder.calls[0]?.url).toBe('https://api.test/x');
  });

  it('keeps absolute URLs untouched', async () => {
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('https://api.test/raw', okSchema, {
      fetchImpl: recorder.fetchImpl,
    });

    expect(recorder.calls[0]?.url).toBe('https://api.test/raw');
  });

  it('sends a Bearer token when provided', async () => {
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('/x', okSchema, {
      token: 'secret',
      fetchImpl: recorder.fetchImpl,
    });

    expect(callHeaders(recorder).get('Authorization')).toBe('Bearer secret');
  });

  it('falls back to the GITHUB_TOKEN env var', async () => {
    process.env.GITHUB_TOKEN = 'env-token';
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('/x', okSchema, { fetchImpl: recorder.fetchImpl });

    expect(callHeaders(recorder).get('Authorization')).toBe('Bearer env-token');
  });

  it('omits the Authorization header without a token', async () => {
    delete process.env.GITHUB_TOKEN;
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('/x', okSchema, { fetchImpl: recorder.fetchImpl });

    expect(callHeaders(recorder).get('Authorization')).toBeNull();
  });

  it('sends the GitHub API version and user agent headers', async () => {
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubJson('/x', okSchema, { fetchImpl: recorder.fetchImpl });
    const headers = callHeaders(recorder);

    expect(headers.get('X-GitHub-Api-Version')).toBe('2022-11-28');
    expect(headers.get('User-Agent')).toBe('reddit-pipeline');
  });

  it('serializes a JSON body and sets the content type', async () => {
    const recorder = staticFetch(jsonResponse({ ok: true }));
    await githubRequest('/x', {
      method: 'POST',
      body: { hello: 'world' },
      fetchImpl: recorder.fetchImpl,
    });
    const call = recorder.calls[0];

    expect(call?.init?.method).toBe('POST');
    expect(call?.init?.body).toBe('{"hello":"world"}');
    expect(callHeaders(recorder).get('Content-Type')).toBe('application/json');
  });

  it('retries transient 500 responses and then succeeds', async () => {
    const recorder = createFetch((_url, index) =>
      Promise.resolve(
        index === 0 ? textResponse('', 500) : jsonResponse({ ok: true }),
      ),
    );

    const result = await withFakeTimers(() =>
      githubJson('/x', okSchema, {
        fetchImpl: recorder.fetchImpl,
        retries: 3,
        baseDelayMs: 1,
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(recorder.calls).toHaveLength(2);
  });

  it('retries rate-limited 429 responses', async () => {
    const recorder = createFetch((_url, index) =>
      Promise.resolve(
        index === 0 ? textResponse('', 429) : jsonResponse({ ok: true }),
      ),
    );

    const result = await withFakeTimers(() =>
      githubJson('/x', okSchema, {
        fetchImpl: recorder.fetchImpl,
        retries: 3,
        baseDelayMs: 1,
        rateLimitDelayMs: 1,
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(recorder.calls).toHaveLength(2);
  });

  it('does not retry a 404 and throws a FetchError with the status', async () => {
    const recorder = staticFetch(textResponse('', 404));

    await expect(
      githubJson('/repos/a/b/readme', okSchema, {
        fetchImpl: recorder.fetchImpl,
        baseDelayMs: 1,
      }),
    ).rejects.toMatchObject({ name: 'FetchError', status: 404 });
    expect(recorder.calls).toHaveLength(1);
  });

  it('gives up after the configured number of attempts', async () => {
    const recorder = staticFetch(textResponse('', 500));

    await expect(
      withFakeTimers(() =>
        githubJson('/x', okSchema, {
          fetchImpl: recorder.fetchImpl,
          retries: 2,
          baseDelayMs: 1,
        }),
      ),
    ).rejects.toMatchObject({ name: 'FetchError', status: 500 });
    expect(recorder.calls).toHaveLength(2);
  });

  it('rejects when the JSON payload does not match the schema', async () => {
    const recorder = staticFetch(jsonResponse({ ok: 'not-a-boolean' }));

    await expect(
      githubJson('/x', okSchema, { fetchImpl: recorder.fetchImpl }),
    ).rejects.toThrow();
  });
});

describe('githubText', () => {
  it('requests the raw media type and returns the body', async () => {
    const recorder = staticFetch(textResponse('# Hello'));

    const text = await githubText('/repos/a/b/readme', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(text).toBe('# Hello');
    expect(callHeaders(recorder).get('Accept')).toBe(
      'application/vnd.github.raw+json',
    );
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

/** Only attach a token when it is actually present. */
function authOptions(): GitHubRequestOptions {
  const token = process.env.GITHUB_TOKEN;
  return token !== undefined && token !== '' ? { token } : {};
}

describe.skipIf(!runIntegration)('github client integration', () => {
  it(
    'fetches the rate limit endpoint',
    async () => {
      const data = await githubJson(
        '/rate_limit',
        z.object({ rate: z.object({ limit: z.number() }) }),
        authOptions(),
      );

      expect(data.rate.limit).toBeGreaterThan(0);
    },
    60000,
  );
});
