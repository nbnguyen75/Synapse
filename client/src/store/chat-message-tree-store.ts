import type { ConversationTreeState } from '@/features/companion/lib/message-tree';

import { create } from 'zustand';

interface ChatMessageTreeState {
  getTree: (conversationId: string) => ConversationTreeState | undefined;
  setTree: (conversationId: string, tree: ConversationTreeState) => void;
  trees: Record<string, ConversationTreeState>;
  clearTree: (conversationId: string) => void;
}

export const useChatMessageTreeStore = create<ChatMessageTreeState>()(
  (set, get) => ({
    clearTree: (conversationId) =>
      set((state) => {
        if (!state.trees[conversationId]) return state;
        const { [conversationId]: _removed, ...trees } = state.trees;
        return { trees };
      }),
    setTree: (conversationId, tree) =>
      set((state) => ({
        trees: { ...state.trees, [conversationId]: tree },
      })),
    getTree: (conversationId) => get().trees[conversationId],
    trees: {},
  }),
);
