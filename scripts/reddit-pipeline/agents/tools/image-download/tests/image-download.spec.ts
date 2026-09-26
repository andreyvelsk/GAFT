import { describe, expect, it } from 'vitest';

import { downloadImageBuffer } from '../index';

/** Build a fetch implementation returning the given bytes. */
function bytesFetch(bytes: number[], status = 200): typeof fetch {
  return () => Promise.resolve(new Response(new Uint8Array(bytes), { status }));
}

describe('downloadImageBuffer', () => {
  it('returns the response body as a buffer', async () => {
    const buffer = await downloadImageBuffer('https://example.com/image.png', {
      fetchImpl: bytesFetch([1, 2, 3, 4]),
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect([...buffer]).toEqual([1, 2, 3, 4]);
  });

  it('throws on a non-OK response', async () => {
    await expect(
      downloadImageBuffer('https://example.com/missing.png', {
        fetchImpl: bytesFetch([], 404),
      }),
    ).rejects.toThrow();
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('image-download integration', () => {
  it(
    'downloads a real image',
    async () => {
      const buffer = await downloadImageBuffer(
        'https://www.gstatic.com/webp/gallery/1.jpg',
      );

      expect(buffer.byteLength).toBeGreaterThan(0);
    },
    60000,
  );
});
