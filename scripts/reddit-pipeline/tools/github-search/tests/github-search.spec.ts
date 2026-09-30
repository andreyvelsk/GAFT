import { describe, expect, it } from 'vitest';

import type { GitHubSearchItem } from '../../../github/client';
import { resolveRepositoryRef, searchRepository } from '../index';

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

/** Build a minimal search item with overrides. */
function searchItem(overrides: Partial<GitHubSearchItem> = {}): GitHubSearchItem {
  return {
    full_name: 'owner/repo',
    name: 'repo',
    owner: { login: 'owner' },
    html_url: 'https://github.com/owner/repo',
    description: null,
    stargazers_count: 0,
    default_branch: 'main',
    ...overrides,
  };
}

describe('resolveRepositoryRef', () => {
  it('resolves a GitHub URL', () => {
    expect(
      resolveRepositoryRef('https://github.com/ChimeraGaming/PixelNavigator'),
    ).toEqual({ owner: 'ChimeraGaming', repo: 'PixelNavigator' });
  });

  it('resolves an owner/repo shorthand', () => {
    expect(resolveRepositoryRef('ChimeraGaming/PixelNavigator')).toEqual({
      owner: 'ChimeraGaming',
      repo: 'PixelNavigator',
    });
  });

  it('returns null for a bare project name', () => {
    expect(resolveRepositoryRef('Pixel Navigator')).toBeNull();
  });
});

describe('searchRepository', () => {
  it('returns null for a blank query without calling the API', async () => {
    const recorder = staticFetch(jsonResponse({ total_count: 0, items: [] }));

    const repo = await searchRepository('   ', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(repo).toBeNull();
    expect(recorder.calls).toHaveLength(0);
  });

  it('resolves an exact GitHub URL without hitting the search API', async () => {
    const recorder = staticFetch(
      jsonResponse(
        searchItem({
          full_name: 'ChimeraGaming/PixelNavigator',
          name: 'PixelNavigator',
          owner: { login: 'ChimeraGaming' },
        }),
      ),
    );

    const repo = await searchRepository(
      'https://github.com/ChimeraGaming/PixelNavigator',
      { fetchImpl: recorder.fetchImpl },
    );

    expect(repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    expect(recorder.calls[0]?.url).toContain(
      '/repos/ChimeraGaming/PixelNavigator',
    );
    expect(recorder.calls[0]?.url).not.toContain('/search/repositories');
  });

  it('searches by name when given a bare project name', async () => {
    const recorder = staticFetch(
      jsonResponse({
        total_count: 1,
        items: [
          searchItem({
            full_name: 'ChimeraGaming/PixelNavigator',
            name: 'PixelNavigator',
            owner: { login: 'ChimeraGaming' },
          }),
        ],
      }),
    );

    const repo = await searchRepository('Pixel Navigator', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    expect(recorder.calls[0]?.url).toContain('/search/repositories');
  });

  it('returns null when nothing matches', async () => {
    const recorder = staticFetch(jsonResponse({ total_count: 0, items: [] }));

    const repo = await searchRepository('Nonexistent', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(repo).toBeNull();
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('github-search integration', () => {
  it(
    'resolves the Pixel Navigator repository from its exact URL',
    async () => {
      const repo = await searchRepository(
        'https://github.com/ChimeraGaming/PixelNavigator',
      );

      expect(repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    },
    60000,
  );
});
