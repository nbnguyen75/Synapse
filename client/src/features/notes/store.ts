import { create } from 'zustand';

interface NoteCreatePrefillState {
  consume: () => undefined | string;
  set: (content: string) => void;
  content: undefined | string;
}

export const useNoteCreatePrefillStore = create<NoteCreatePrefillState>()((set, get) => ({
  consume: () => {
    const content = get().content;
    set({ content: undefined });
    return content;
  },
  set: (content) => set({ content }),
  content: undefined,
}));
