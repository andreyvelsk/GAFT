import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { convertImageToWebp } from '../index';

/** Build a small PNG buffer for the conversion tests. */
async function makePng(): Promise<Buffer> {
  return await sharp({
    create: {
      width: 4,
      height: 4,
      channels: 3,
      background: { r: 0, g: 128, b: 255 },
    },
  })
    .png()
    .toBuffer();
}

describe('convertImageToWebp', () => {
  it('converts a PNG buffer into a valid WebP', async () => {
    const png = await makePng();

    const result = await convertImageToWebp(png);

    expect(result.bytes).toBeGreaterThan(0);
    expect(result.buffer.byteLength).toBe(result.bytes);
    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.format).toBe('webp');
  });
});

const runIntegration = process.env.RUN_MEDIA_INTEGRATION === 'true';

describe.skipIf(!runIntegration)('webp-convert integration', () => {
  it(
    'converts a downloaded JPEG into WebP',
    async () => {
      const response = await fetch('https://www.gstatic.com/webp/gallery/1.jpg');
      const input = Buffer.from(await response.arrayBuffer());

      const result = await convertImageToWebp(input);

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('webp');
    },
    60000,
  );
});
