import { sleep } from './helpers';

/** Options controlling the retry/backoff behaviour. */
export interface RetryOptions {
  /** Total number of attempts, including the first one. */
  retries: number;

  /** Base delay in ms; multiplied by the (zero-based) attempt number. */
  baseDelayMs: number;

  /** Delay in ms used for rate-limited (HTTP 429) responses. */
  rateLimitDelayMs: number;

  /** Predicate detecting a rate-limit error. */
  isRateLimit?: (error: unknown) => boolean;

  /** Called before each retry with the error and the zero-based attempt. */
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Run `operation`, retrying with linear backoff on failure.
 * The last error is re-thrown once all attempts are exhausted.
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  for (let attempt = 0; attempt < options.retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === options.retries - 1) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      const rateLimited = options.isRateLimit?.(error) ?? false;
      const delay = rateLimited
        ? options.rateLimitDelayMs * (attempt + 1)
        : options.baseDelayMs * (attempt + 1);
      options.onRetry?.(error, attempt);
      await sleep(delay);
    }
  }
  throw new Error('retry: no attempts configured');
}
