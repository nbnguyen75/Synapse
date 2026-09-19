import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';

import { pick } from '@/providers/router';

export interface PickedModel {
  model: ReturnType<GoogleGenerativeAIProvider>;
  reportRateLimit: () => void;
  modelId: string;
}

export interface PickedEmbeddingModel {
  model: ReturnType<GoogleGenerativeAIProvider['embeddingModel']>;
  reportRateLimit: () => void;
  modelId: string;
}

export function getChatModel(): PickedModel {
  const { reportRateLimit, provider, modelId } = pick('chat');
  return { model: provider(modelId), reportRateLimit, modelId };
}

export function getTitleModel(): PickedModel {
  const { reportRateLimit, provider, modelId } = pick('title');
  return { model: provider(modelId), reportRateLimit, modelId };
}

export function getEmbeddingModel(): PickedEmbeddingModel {
  const { reportRateLimit, provider, modelId } = pick('embed');
  return { model: provider.embeddingModel(modelId), reportRateLimit, modelId };
}
