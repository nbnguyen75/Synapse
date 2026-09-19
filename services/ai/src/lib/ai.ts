import { embed } from 'ai';

import { isRateLimitOrQuota, withRetry } from '@/lib/retry';
import { getEmbeddingModel } from '@/providers/ai-studio';

export async function embedText(text: string) {
  try {
    const { embedding } = await withRetry(async () => {
      const picked = getEmbeddingModel();

      try {
        return await embed({
          providerOptions: {
            google: {
              outputDimensionality: 768,
            },
          },
          model: picked.model,
          value: text,
        });
      } catch (error) {
        if (isRateLimitOrQuota(error)) picked.reportRateLimit();
        throw error;
      }
    });
    return embedding;
  } catch (e) {
    console.error('[Embedding failed]:', e);
    return null;
  }
}
