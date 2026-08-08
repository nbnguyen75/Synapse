import { create } from 'zustand';

interface CompanionState {
  setActiveConversationId: (id: string | null) => void;
  activeConversationId: string | null;
}

export const useCompanionStore = create<CompanionState>()((set) => ({
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),
  activeConversationId: null,
}));
