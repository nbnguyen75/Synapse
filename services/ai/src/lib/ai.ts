import { embed } from 'ai';

import { vertexGeminiEmbedding001 } from '@/providers/agent-platform';
import { withRetry } from '@/lib/retry';

export async function embedText(text: string) {
	try {
		const { embedding } = await withRetry(() =>
			embed({
				providerOptions: {
					google: {
						outputDimensionality: 768
					}
				},
				model: vertexGeminiEmbedding001,
				value: text
			})
		);
		return embedding;
	} catch (e) {
		console.error('[Embedding failed]:', e);
		return null;
	}
}
