import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { env } from '@/config/env';

export const googleAiStudio = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY
});

export const aiStudio36FlashLite = googleAiStudio('gemini-3.5-flash-lite');
export const aiStudioEmbedding001 = googleAiStudio.embeddingModel('gemini-embedding-001');
export const aiStudioGemma431bIt = googleAiStudio('gemma-4-31b-it');
