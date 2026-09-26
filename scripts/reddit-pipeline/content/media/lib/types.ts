/** Options for downloading and converting a single image. */
export interface DownloadImageOptions {
  /** Signed image URL to download. */
  url: string;

  /** Absolute path of the WebP file to write. */
  outputPath: string;

  /** Optional fetch implementation (used by tests). */
  fetchImpl?: typeof fetch;
}

/** Result of a download + convert + write operation. */
export interface MediaResult {
  /** Absolute path of the written WebP file. */
  outputPath: string;

  /** Size of the written file in bytes. */
  bytes: number;
}
