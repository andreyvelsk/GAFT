import { describe, expect, it } from 'vitest';

import type { GitHubSearchItem } from '../../client';
import {
  findRepo,
  getRepo,
  latestRelease,
  latestReleaseUrl,
  normalizeName,
  parseRepoRef,
  parseRepoUrl,
  pickBestMatch,
  readReadme,
  type RepoOptions,
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

describe('normalizeName', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(normalizeName('Pixel Navigator')).toBe('pixelnavigator');
    expect(normalizeName('PixelNavigator')).toBe('pixelnavigator');
    expect(normalizeName('pixel-navigator_v2')).toBe('pixelnavigatorv2');
  });
});

describe('pickBestMatch', () => {
  it('prefers the exact normalized name match', () => {
    const clone = searchItem({
      full_name: 'someone/pixel-navigator-clone',
      name: 'pixel-navigator-clone',
    });
    const target = searchItem({
      full_name: 'ChimeraGaming/PixelNavigator',
      name: 'PixelNavigator',
      owner: { login: 'ChimeraGaming' },
    });

    expect(pickBestMatch('Pixel Navigator', [clone, target])).toBe(target);
  });

  it('falls back to the first result when nothing matches exactly', () => {
    const first = searchItem({ name: 'unrelated' });
    const second = searchItem({ name: 'also-unrelated' });

    expect(pickBestMatch('Pixel Navigator', [first, second])).toBe(first);
  });

  it('returns null for an empty result set', () => {
    expect(pickBestMatch('Pixel Navigator', [])).toBeNull();
  });
});

describe('parseRepoUrl', () => {
  it('extracts owner and repo from a GitHub URL', () => {
    expect(parseRepoUrl('https://github.com/ChimeraGaming/PixelNavigator')).toEqual(
      { owner: 'ChimeraGaming', repo: 'PixelNavigator' },
    );
  });

  it('strips a trailing .git suffix and path segments', () => {
    expect(parseRepoUrl('https://github.com/user/repo.git/tree/main')).toEqual({
      owner: 'user',
      repo: 'repo',
    });
  });

  it('returns null for non-GitHub URLs', () => {
    expect(parseRepoUrl('https://example.com/user/repo')).toBeNull();
    expect(parseRepoUrl('not a url')).toBeNull();
  });
});

describe('parseRepoRef', () => {
  it('resolves a GitHub URL', () => {
    expect(parseRepoRef('https://github.com/ChimeraGaming/PixelNavigator')).toEqual(
      { owner: 'ChimeraGaming', repo: 'PixelNavigator' },
    );
  });

  it('resolves an owner/repo shorthand', () => {
    expect(parseRepoRef('ChimeraGaming/PixelNavigator')).toEqual({
      owner: 'ChimeraGaming',
      repo: 'PixelNavigator',
    });
  });

  it('returns null for a bare project name', () => {
    expect(parseRepoRef('Pixel Navigator')).toBeNull();
  });
});

describe('getRepo', () => {
  it('fetches the repository by exact coordinates', async () => {
    const recorder = staticFetch(
      jsonResponse(
        searchItem({
          full_name: 'ChimeraGaming/PixelNavigator',
          name: 'PixelNavigator',
          owner: { login: 'ChimeraGaming' },
          html_url: 'https://github.com/ChimeraGaming/PixelNavigator',
          description: 'Android map companion',
          stargazers_count: 42,
          default_branch: 'master',
        }),
      ),
    );

    const repo = await getRepo('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(repo.fullName).toBe('ChimeraGaming/PixelNavigator');
    expect(recorder.calls[0]?.url).toContain(
      '/repos/ChimeraGaming/PixelNavigator',
    );
  });
});

describe('findRepo', () => {
  it('finds the exact repository and maps its fields', async () => {
    const recorder = staticFetch(
      jsonResponse({
        total_count: 2,
        items: [
          searchItem({
            full_name: 'someone/pixel-navigator-clone',
            name: 'pixel-navigator-clone',
          }),
          searchItem({
            full_name: 'ChimeraGaming/PixelNavigator',
            name: 'PixelNavigator',
            owner: { login: 'ChimeraGaming' },
            html_url: 'https://github.com/ChimeraGaming/PixelNavigator',
            description: 'Android map companion',
            stargazers_count: 42,
            default_branch: 'master',
          }),
        ],
      }),
    );

    const repo = await findRepo('Pixel Navigator', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(repo).toEqual({
      owner: 'ChimeraGaming',
      repo: 'PixelNavigator',
      fullName: 'ChimeraGaming/PixelNavigator',
      htmlUrl: 'https://github.com/ChimeraGaming/PixelNavigator',
      description: 'Android map companion',
      stars: 42,
      defaultBranch: 'master',
    });
  });

  it('searches by name and requests a page of results', async () => {
    const recorder = staticFetch(jsonResponse({ total_count: 0, items: [] }));
    await findRepo('Pixel Navigator', { fetchImpl: recorder.fetchImpl });

    const url = recorder.calls[0]?.url ?? '';
    expect(url).toContain('/search/repositories');
    expect(url).toContain('in%3Aname');
    expect(url).toContain('per_page=10');
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

    const repo = await findRepo(
      'https://github.com/ChimeraGaming/PixelNavigator',
      { fetchImpl: recorder.fetchImpl },
    );

    expect(repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    expect(recorder.calls[0]?.url).toContain(
      '/repos/ChimeraGaming/PixelNavigator',
    );
    expect(recorder.calls[0]?.url).not.toContain('/search/repositories');
  });

  it('returns null when there are no matches', async () => {
    const recorder = staticFetch(jsonResponse({ total_count: 0, items: [] }));
    const repo = await findRepo('Nonexistent', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(repo).toBeNull();
  });
});

describe('readReadme', () => {
  it('returns the raw README text', async () => {
    const recorder = staticFetch(textResponse('# Pixel Navigator\n'));
    const readme = await readReadme('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(readme).toBe('# Pixel Navigator\n');
    expect(recorder.calls[0]?.url).toContain(
      '/repos/ChimeraGaming/PixelNavigator/readme',
    );
  });

  it('returns null on a 404 response', async () => {
    const recorder = staticFetch(textResponse('', 404));
    const readme = await readReadme('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(readme).toBeNull();
  });
});

describe('latestReleaseUrl', () => {
  it('builds the canonical latest release URL', () => {
    expect(latestReleaseUrl('ChimeraGaming', 'PixelNavigator')).toBe(
      'https://github.com/ChimeraGaming/PixelNavigator/releases/latest',
    );
  });
});

describe('latestRelease', () => {
  it('returns the release with a canonical latest URL', async () => {
    const recorder = staticFetch(
      jsonResponse({
        tag_name: 'v1.2.0',
        name: 'Version 1.2.0',
        html_url: 'https://github.com/ChimeraGaming/PixelNavigator/releases/tag/v1.2.0',
        published_at: '2026-09-01T00:00:00Z',
      }),
    );

    const release = await latestRelease('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(release).toEqual({
      tagName: 'v1.2.0',
      name: 'Version 1.2.0',
      publishedAt: '2026-09-01T00:00:00Z',
      url: 'https://github.com/ChimeraGaming/PixelNavigator/releases/latest',
      htmlUrl:
        'https://github.com/ChimeraGaming/PixelNavigator/releases/tag/v1.2.0',
    });
  });

  it('falls back to the tag when the release has no name', async () => {
    const recorder = staticFetch(
      jsonResponse({
        tag_name: 'v0.1.0',
        name: null,
        html_url: 'https://github.com/o/r/releases/tag/v0.1.0',
        published_at: null,
      }),
    );

    const release = await latestRelease('o', 'r', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(release?.name).toBe('v0.1.0');
    expect(release?.publishedAt).toBe('');
  });

  it('returns null when the repository has no releases', async () => {
    const recorder = staticFetch(textResponse('', 404));
    const release = await latestRelease('o', 'r', {
      fetchImpl: recorder.fetchImpl,
    });

    expect(release).toBeNull();
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

/** Only attach a token when it is actually present. */
function authOptions(): RepoOptions {
  const token = process.env.GITHUB_TOKEN;
  return token !== undefined && token !== '' ? { token } : {};
}

describe.skipIf(!runIntegration)('github repo integration', () => {
  it(
    'resolves the Pixel Navigator repository from its exact URL',
    async () => {
      const repo = await findRepo(
        'https://github.com/ChimeraGaming/PixelNavigator',
        authOptions(),
      );

      expect(repo?.fullName).toBe('ChimeraGaming/PixelNavigator');
    },
    60000,
  );

  it(
    'reads the Pixel Navigator README',
    async () => {
      const readme = await readReadme(
        'ChimeraGaming',
        'PixelNavigator',
        authOptions(),
      );

      expect(readme).not.toBeNull();
      expect((readme ?? '').length).toBeGreaterThan(0);
    },
    60000,
  );

  it(
    'returns the canonical latest release URL',
    async () => {
      const release = await latestRelease(
        'ChimeraGaming',
        'PixelNavigator',
        authOptions(),
      );

      if (release !== null) {
        expect(release.url).toBe(
          'https://github.com/ChimeraGaming/PixelNavigator/releases/latest',
        );
      }
    },
    60000,
  );
});
