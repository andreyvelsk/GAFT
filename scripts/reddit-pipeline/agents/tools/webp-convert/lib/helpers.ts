import { convertToWebp } from '../../../../content/media';
import type { WebpConversionResult } from './types';

/** Convert an image buffer to WebP. */
export async function convertImageToWebp(
  input: Buffer,
): Promise<WebpConversionResult> {
  const buffer = await convertToWebp(input);
  return { buffer, bytes: buffer.byteLength };
}
