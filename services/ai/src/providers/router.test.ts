/// <reference types="bun-types" />

import type { getChatModel as getChatModelFn } from '@/providers/ai-studio';

import { beforeAll, describe, expect, test } from 'bun:test';

let getChatModel: typeof getChatModelFn;

const CHAT_CHAIN = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash',
];

beforeAll(async () => {
  process.env.GOOGLE_GENERATIVE_AI_API_KEYS = 'fake-key';
  ({ getChatModel } = await import('@/providers/ai-studio'));
});

describe('AI Studio multi-key router', () => {
  test('a banned (key, model) pair advances down the chat chain', () => {
    const first = getChatModel();
    expect(first.modelId).toBe('gemini-3.5-flash-lite');

    first.reportRateLimit();

    expect(getChatModel().modelId).toBe('gemini-3.1-flash-lite');
  });

  test('all-banned chain de-bans the earliest-expiring pair', () => {
    const bannedModels = new Set<string>();
    while (bannedModels.size < 8) {
      const picked = getChatModel();
      bannedModels.add(picked.modelId);
      picked.reportRateLimit();
    }
    expect(bannedModels.size).toBe(8);

    expect(CHAT_CHAIN).toContain(getChatModel().modelId);
  });
});
