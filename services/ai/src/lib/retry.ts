import { APICallError } from 'ai';

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
	let lastErr: unknown;

	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (err) {
			lastErr = err;

			const isRateLimit =
				APICallError.isInstance(err) && (err.statusCode === 429 || /429/.test(err.message));

			if (!isRateLimit) throw err;

			const delay = 2 ** i * 1000; // 1s, 2s, 4s
			await new Promise((r) => setTimeout(r, delay));
		}
	}

	throw lastErr;
}
