import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import {
  convertToWebp,
  downloadImage,
  mediaFileName,
  saveImage,
} from '../index';

/** Build a small PNG buffer for the conversion tests. */
async function makePng(): Promise<Buffer> {
  return await sharp({
    create: {
      width: 4,
      height: 4,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();
}

/** Create a temporary directory for a test. */
async function makeTempDir(): Promise<string> {
  return await mkdtemp(join(tmpdir(), 'reddit-media-test-'));
}

describe('mediaFileName', () => {
  it('uses preview.webp for the first image', () => {
    expect(mediaFileName(1)).toBe('preview.webp');
  });

  it('uses screenshot-N.webp for later images', () => {
    expect(mediaFileName(2)).toBe('screenshot-2.webp');
    expect(mediaFileName(3)).toBe('screenshot-3.webp');
  });
});

describe('convertToWebp', () => {
  it('converts a PNG buffer into a valid WebP', async () => {
    const png = await makePng();
    const webp = await convertToWebp(png);

    expect(webp.byteLength).toBeGreaterThan(0);
    const metadata = await sharp(webp).metadata();
    expect(metadata.format).toBe('webp');
  });
});

describe('downloadImage', () => {
  it('throws on a non-OK response', async () => {
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(new Response('', { status: 404 }));

    await expect(
      downloadImage('https://example.com/missing.png', fetchImpl),
    ).rejects.toThrow();
  });
});

describe('saveImage', () => {
  it('downloads, converts and writes a WebP file', async () => {
    const dir = await makeTempDir();
    try {
      const png = await makePng();
      const fetchImpl: typeof fetch = () =>
        Promise.resolve(new Response(new Uint8Array(png), { status: 200 }));
      const outputPath = join(dir, 'preview.webp');

      const result = await saveImage({
        url: 'https://example.com/image.png',
        outputPath,
        fetchImpl,
      });

      expect(result.bytes).toBeGreaterThan(0);
      const written = await readFile(outputPath);
      expect(written.byteLength).toBe(result.bytes);
      const metadata = await sharp(written).metadata();
      expect(metadata.format).toBe('webp');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('media integration', () => {
  it(
    'downloads a remote image and converts it to WebP',
    async () => {
      const dir = await makeTempDir();
      try {
        const outputPath = join(dir, 'preview.webp');
        const result = await saveImage({
          url: 'https://www.gstatic.com/webp/gallery/1.jpg',
          outputPath,
        });

        expect(result.bytes).toBeGreaterThan(0);
        const metadata = await sharp(await readFile(outputPath)).metadata();
        expect(metadata.format).toBe('webp');
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
    60000,
  );
});
