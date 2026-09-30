import { downloadImage } from '../../../content/media';
import type { ImageDownloadOptions } from './types';

/** Download an image and return its raw bytes. */
export async function downloadImageBuffer(
  url: string,
  options: ImageDownloadOptions = {},
): Promise<Buffer> {
  return await downloadImage(url, options.fetchImpl);
}
