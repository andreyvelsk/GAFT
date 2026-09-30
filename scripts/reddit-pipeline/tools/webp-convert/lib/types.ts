/** Result of a WebP conversion. */
export interface WebpConversionResult {
  /** Converted WebP bytes. */
  buffer: Buffer;

  /** Size of the converted image in bytes. */
  bytes: number;
}
