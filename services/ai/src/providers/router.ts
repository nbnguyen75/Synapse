import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';

import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { env } from '@/config/env';

export type RouteTask = 'embed' | 'title' | 'chat';
type TaskChains = Record<RouteTask, ReadonlyArray<string>>;

const CHAINS: TaskChains = {
  chat: [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
  ],
  title: ['gemini-2.5-flash-lite', 'gemini-3-flash', 'gemini-2.5-flash'],
  embed: ['gemini-embedding-001', 'gemini-embedding-002'],
};

const providers: Array<GoogleGenerativeAIProvider> = env.GOOGLE_GENERATIVE_AI_API_KEYS.map(
  (apiKey) => createGoogleGenerativeAI({ apiKey }),
);

const bannedUntil = new Map<string, number>();
let roundRobinCursor = 0;

function ban(keyIndex: number, modelId: string): void {
  bannedUntil.set(`${keyIndex}:${modelId}`, Date.now() + env.GOOGLE_GENERATIVE_AI_COOLDOWN_MS);
}

function isHealthy(keyIndex: number, modelId: string): boolean {
  const until = bannedUntil.get(`${keyIndex}:${modelId}`);
  return until === undefined || until <= Date.now();
}

export interface PickedProvider {
  provider: GoogleGenerativeAIProvider;
  reportRateLimit: () => void;
  modelId: string;
}

export function pick(task: RouteTask): PickedProvider {
  for (const modelId of CHAINS[task]) {
    for (let step = 0; step < providers.length; step++) {
      const keyIndex = (roundRobinCursor + step) % providers.length;
      if (!isHealthy(keyIndex, modelId)) continue;

      const provider = providers[keyIndex];
      if (!provider) continue;

      roundRobinCursor = (keyIndex + 1) % providers.length;
      return {
        reportRateLimit: () => ban(keyIndex, modelId),
        provider,
        modelId,
      };
    }
  }

  let deBanKeyIndex = -1;
  let deBanModelId = '';
  let earliest = Number.MAX_SAFE_INTEGER;
  for (const modelId of CHAINS[task]) {
    for (let keyIndex = 0; keyIndex < providers.length; keyIndex++) {
      const until = bannedUntil.get(`${keyIndex}:${modelId}`);
      if (until !== undefined && until < earliest) {
        earliest = until;
        deBanKeyIndex = keyIndex;
        deBanModelId = modelId;
      }
    }
  }

  if (deBanKeyIndex < 0) {
    throw new Error('AI router: no viable (key, model) pair');
  }

  const deBanProvider = providers[deBanKeyIndex];
  if (!deBanProvider) {
    throw new Error('AI router: no viable (key, model) pair');
  }

  roundRobinCursor = (deBanKeyIndex + 1) % providers.length;
  return {
    reportRateLimit: () => ban(deBanKeyIndex, deBanModelId),
    provider: deBanProvider,
    modelId: deBanModelId,
  };
}
