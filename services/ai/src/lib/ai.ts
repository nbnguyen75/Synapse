import { google } from '@ai-sdk/google';
import { embed } from 'ai';

import { withRetry } from '@/lib/retry';

export const chatModel = google('gemini-3.5-flash-lite');
export const embeddingModel = google.embeddingModel('gemini-embedding-001');
export const generateTitleModel = google('gemini-3.1-flash-lite-preview');

export async function embedText(text: string) {
	const { embedding } = await withRetry(() =>
		embed({
			providerOptions: {
				google: {
					outputDimensionality: 768
				}
			},
			model: embeddingModel,
			value: text
		})
	);
	return embedding;
}
