import { create } from 'zustand';

export interface ChatNoteAttachment {
  content: string;
  title: string;
  file: File;
  id: string;
}

export const MAX_CHAT_ATTACHMENTS = 10;

const NOTE_ATTACHMENT_FILENAME_MAX_CHARS = 60;

export function buildNoteChatAttachment(input: {
  content: string;
  title: string;
  id: string;
}): ChatNoteAttachment {
  const safeTitle = (input.title || '')
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .slice(0, NOTE_ATTACHMENT_FILENAME_MAX_CHARS);
  const filename = `${safeTitle || 'Untitled'}.md`;

  return {
    file: new File([input.content ?? ''], filename, {
      type: 'text/markdown',
    }),
    content: input.content ?? '',
    title: input.title ?? '',
    id: input.id,
  };
}

interface ChatNoteAttachmentState {
  add: (attachment: ChatNoteAttachment) => boolean;
  attachments: ChatNoteAttachment[];
  clear: () => void;
}

export const useChatNoteAttachmentStore = create<ChatNoteAttachmentState>()((set) => ({
  add: (attachment) => {
    let added = false;
    set((state) => {
      if (state.attachments.some((item) => item.id === attachment.id)) {
        return state;
      }
      if (state.attachments.length >= MAX_CHAT_ATTACHMENTS) {
        return state;
      }
      added = true;
      return { attachments: [...state.attachments, attachment] };
    });
    return added;
  },
  clear: () => set({ attachments: [] }),
  attachments: [],
}));
