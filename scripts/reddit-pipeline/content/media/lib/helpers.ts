import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

import sharp from 'sharp';

import { PREVIEW_FILE_NAME } from '../../../shared/lib/constants';
import { FetchError } from '../../../shared/lib/errors';
import { screenshotFileName } from '../../../shared/lib/helpers';
import type { DownloadImageOptions, MediaResult } from './types';

/** WebP quality used for the conversion. */
const WEBP_QUALITY = 80;

/** Promisified `execFile` used for the `cwebp` fallback. */
const execFileAsync = promisify(execFile);

/** Download an image, throwing a `FetchError` on a non-OK response. */
export async function downloadImage(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Buffer> {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new FetchError(
      `HTTP ${response.status} for ${url}`,
      url,
      response.status,
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Convert an image buffer to WebP using `sharp`. */
async function convertWithSharp(input: Buffer): Promise<Buffer> {
  return await sharp(input).webp({ quality: WEBP_QUALITY }).toBuffer();
}

/** Convert an image buffer to WebP using the `cwebp` CLI. */
async function convertWithCwebp(input: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'reddit-media-'));
  const inputPath = join(dir, 'input');
  const outputPath = join(dir, 'output.webp');
  try {
    await writeFile(inputPath, input);
    await execFileAsync('cwebp', [
      '-quiet',
      '-q',
      String(WEBP_QUALITY),
      inputPath,
      '-o',
      outputPath,
    ]);
    return await readFile(outputPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Convert an image buffer to WebP. Uses `sharp` (no system dependencies) and
 * falls back to the `cwebp` CLI when `sharp` fails and `cwebp` is available.
 */
export async function convertToWebp(input: Buffer): Promise<Buffer> {
  try {
    return await convertWithSharp(input);
  } catch (error) {
    try {
      return await convertWithCwebp(input);
    } catch {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

/** File name of the n-th image of a page (1-based index). */
export function mediaFileName(index: number): string {
  return index <= 1 ? PREVIEW_FILE_NAME : screenshotFileName(index);
}

/** Download an image, convert it to WebP and write it to `outputPath`. */
export async function saveImage(
  options: DownloadImageOptions,
): Promise<MediaResult> {
  const buffer = await downloadImage(options.url, options.fetchImpl);
  const webp = await convertToWebp(buffer);
  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, webp);
  return { outputPath: options.outputPath, bytes: webp.byteLength };
}
