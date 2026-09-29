import { describe, expect, it } from 'vitest';

import { readRepositoryReadme } from '../index';

/** Build a fetch implementation that always returns the same response. */
function staticFetch(response: Response): typeof fetch {
  return () => Promise.resolve(response);
}

/** Build a plain-text `Response` for the mocked `fetch`. */
function textResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

describe('readRepositoryReadme', () => {
  it('returns the raw README text', async () => {
    const readme = await readRepositoryReadme('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: staticFetch(textResponse('# Pixel Navigator\n')),
    });

    expect(readme).toBe('# Pixel Navigator\n');
  });

  it('returns null on a 404 response', async () => {
    const readme = await readRepositoryReadme('ChimeraGaming', 'PixelNavigator', {
      fetchImpl: staticFetch(textResponse('', 404)),
    });

    expect(readme).toBeNull();
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('github-readme integration', () => {
  it(
    'reads the Pixel Navigator README',
    async () => {
      const readme = await readRepositoryReadme(
        'ChimeraGaming',
        'PixelNavigator',
      );

      expect(readme).not.toBeNull();
      expect((readme ?? '').length).toBeGreaterThan(0);
    },
    60000,
  );
});
