import { logger } from './logger.js';

export interface ResilienceOptions {
  timeoutMs?: number;
  maxRetries?: number;
  backoffFactorMs?: number;
  serviceName: string;
}

/**
 * Executes an asynchronous function with a timeout, retry mechanism, and exponential backoff.
 * Prevents third-party provider hangs or crashes from bringing down the Express process.
 */
export async function callWithResilience<T>(
  fn: () => Promise<T>,
  options: ResilienceOptions
): Promise<T> {
  const {
    timeoutMs = 8000,
    maxRetries = 2,
    backoffFactorMs = 400,
    serviceName
  } = options;

  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    try {
      attempt++;
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`[${serviceName}] Call timed out after ${timeoutMs}ms`)), timeoutMs)
        )
      ]);
      return result;
    } catch (err: any) {
      lastError = err;
      logger.warn(`[${serviceName}] Call failed on attempt ${attempt}/${maxRetries + 1}`, {
        meta: { error: err.message, attempt, serviceName }
      });

      if (attempt <= maxRetries) {
        const delay = backoffFactorMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`[${serviceName}] All ${maxRetries + 1} attempts exhausted. Gracefully failing.`, lastError);
  throw lastError;
}
