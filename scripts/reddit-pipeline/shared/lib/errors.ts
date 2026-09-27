/** Error thrown when a Reddit mirror (or other HTTP) request fails. */
export class FetchError extends Error {
  /** URL that produced the error. */
  readonly url: string;

  /** HTTP status code, when the failure came from a response. */
  readonly status: number | undefined;

  /**
   * Suggested delay (ms) before retrying, derived from a `Retry-After` or
   * `x-ratelimit-reset` header. `undefined` when the server gave no hint.
   */
  readonly retryAfterMs: number | undefined;

  constructor(
    message: string,
    url: string,
    status?: number,
    retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'FetchError';
    this.url = url;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

/** Options accepted by `AgentError`. */
export interface AgentErrorOptions {
  /** Underlying error that caused the agent failure. */
  cause?: unknown;
}

/** Error thrown when an LLM agent cannot produce a valid result. */
export class AgentError extends Error {
  /** Name of the agent that failed. */
  readonly agent: string;

  constructor(message: string, agent: string, options: AgentErrorOptions = {}) {
    super(message, options);
    this.name = 'AgentError';
    this.agent = agent;
  }
}

/** Error thrown when data does not match its expected shape. */
export class ValidationError extends Error {
  /** Human-readable description of the validation failure. */
  readonly details: string;

  constructor(message: string, details = '') {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}
