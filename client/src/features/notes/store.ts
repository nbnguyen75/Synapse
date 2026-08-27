import { create } from 'zustand';

interface NoteCreatePrefillState {
  consume: () => string | undefined;
  set: (content: string) => void;
  content: string | undefined;
}

export const useNoteCreatePrefillStore = create<NoteCreatePrefillState>()(
  (set, get) => ({
    consume: () => {
      const content = get().content;
      set({ content: undefined });
      return content;
    },
    set: (content) => set({ content }),
    content: undefined,
  }),
);
