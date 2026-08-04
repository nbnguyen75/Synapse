import { google } from '@ai-sdk/google';
import { embed } from 'ai';

import { withRetry } from '@/lib/retry';

export const chatModel = google('gemini-3.5-flash-lite');
export const embeddingModel = google.embeddingModel('gemini-embedding-001');
export const generateTitleModel = google('gemma-4-31b-it');

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
