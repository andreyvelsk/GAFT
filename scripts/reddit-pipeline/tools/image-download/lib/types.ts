/** Options accepted by the image-download tool. */
export interface ImageDownloadOptions {
  /** Optional fetch implementation (used by tests). */
  fetchImpl?: typeof fetch;
}
