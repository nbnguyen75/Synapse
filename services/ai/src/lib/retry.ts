import { APICallError } from 'ai';

export function isRateLimitOrQuota(err: unknown): boolean {
  return APICallError.isInstance(err) && (err.statusCode === 429 || err.statusCode === 403);
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastErr: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      if (!isRateLimitOrQuota(err)) throw err;

      const delay = 2 ** i * 1000; // 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('Retry failed', { cause: lastErr });
}
