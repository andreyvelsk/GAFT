import { describe, expect, it } from 'vitest';

import { getLatestRelease, getLatestReleaseUrl } from '../index';

/** Build a fetch implementation that always returns the same response. */
function staticFetch(response: Response): typeof fetch {
  return () => Promise.resolve(response);
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

describe('getLatestReleaseUrl', () => {
  it('builds the canonical latest release URL', () => {
    expect(getLatestReleaseUrl('ChimeraGaming', 'PixelNavigator')).toBe(
      'https://github.com/ChimeraGaming/PixelNavigator/releases/latest',
    );
  });
});

describe('getLatestRelease', () => {
  it('returns the release with a canonical latest URL', async () => {
    const release = await getLatestRelease('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: staticFetch(
        jsonResponse({
          tag_name: 'v1.2.0',
          name: 'Version 1.2.0',
          html_url:
            'https://github.com/ChimeraGaming/PixelNavigator/releases/tag/v1.2.0',
          published_at: '2026-09-01T00:00:00Z',
        }),
      ),
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

  it('returns null when the repository has no releases', async () => {
    const release = await getLatestRelease('o', 'r', {
      fetchImpl: staticFetch(textResponse('', 404)),
    });

    expect(release).toBeNull();
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('github-release integration', () => {
  it(
    'returns the canonical latest release URL',
    async () => {
      const release = await getLatestRelease(
        'ChimeraGaming',
        'PixelNavigator',
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
