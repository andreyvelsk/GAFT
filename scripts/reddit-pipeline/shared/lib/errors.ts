/** Error thrown when a Reddit mirror (or other HTTP) request fails. */
export class FetchError extends Error {
  /** URL that produced the error. */
  readonly url: string;

  /** HTTP status code, when the failure came from a response. */
  readonly status: number | undefined;

  constructor(message: string, url: string, status?: number) {
    super(message);
    this.name = 'FetchError';
    this.url = url;
    this.status = status;
  }
}
