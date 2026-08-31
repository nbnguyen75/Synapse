import type { Note, NoteViewMode } from '@/features/notes/types';

import { useCallback, useMemo, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { format } from 'date-fns';
import { toast } from 'sonner';

import {
  buildNoteChatAttachment,
  useChatNoteAttachmentStore,
} from '@/store/chat-note-attachment-store';

import { useConfirm } from '@/providers';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

import {
  countWordsMarkdownSync,
  exportMarkdown,
  getMarkdownReadTimeSync,
} from '@/features/notes/service';
import { useGoToCompanion } from '@/features/companion/hooks/use-go-to-companion';
import { noteKeys } from '@/features/notes/keys';

export interface NoteWithDetails extends Note {
  tags?: string[];
}

const MAX_VISIBLE_TAGS = 3;
const PREVIEW_CHAR_LIMIT = 300;

const NOTE_ACTIONS = {
  favorite: (note: Note) =>
    $fetch.api.v1.notes[':id'].$patch({
      body: { favorite: !note.favorite },
      params: { id: note.id },
    }),

  archive: (note: Note) =>
    $fetch.api.v1.notes[':id'].$patch({
      body: { status: 'ARCHIVED' },
      params: { id: note.id },
    }),

  unarchive: (note: Note) =>
    $fetch.api.v1.notes[':id'].$patch({
      body: { status: 'ACTIVE' },
      params: { id: note.id },
    }),

  pin: (note: Note) =>
    $fetch.api.v1.notes[':id'].$patch({
      body: { pinned: !note.pinned },
      params: { id: note.id },
    }),

  restore: (note: Note) =>
    $fetch.api.v1.notes[':id'].$patch({
      body: { status: 'ACTIVE' },
      params: { id: note.id },
    }),

  trash: (note: Note) =>
    $fetch.api.v1.notes[':id'].$patch({
      body: { status: 'TRASHED' },
      params: { id: note.id },
    }),

  delete: (note: Note) =>
    $fetch.api.v1.notes[':id'].$delete({
      params: { id: note.id },
    }),
} as const;

export type NoteActionType = keyof typeof NOTE_ACTIONS;

type NoteActionResultData<T extends NoteActionType> = Awaited<
  ReturnType<(typeof NOTE_ACTIONS)[T]>
>['data'];

async function executeNoteAction(type: NoteActionType, note: Note) {
  const actionFn = NOTE_ACTIONS[type];
  if (!actionFn) throw new Error(`Unsupported note action: ${type}`);

  const result = await actionFn(note);
  return result.data;
}

const ERROR_TOAST_MAP = {
  unarchive: () =>
    toast.error(m.notes_page_toast_unarchive_failed(), {
      description: m.common_error_connection(),
    }),
  archive: () =>
    toast.error(m.notes_page_toast_archive_failed(), {
      description: m.common_error_connection(),
    }),
  favorite: () =>
    toast.error(m.notes_page_toast_update_failed(), {
      description: m.common_error_connection(),
    }),
  restore: () =>
    toast.error(m.notes_page_toast_restore_failed(), {
      description: m.common_error_connection(),
    }),
  delete: () =>
    toast.error(m.notes_page_toast_delete_failed(), {
      description: m.common_error_connection(),
    }),
  trash: () =>
    toast.error(m.notes_page_toast_trash_failed(), {
      description: m.common_error_connection(),
    }),
  pin: () =>
    toast.error(m.notes_page_toast_update_failed(), {
      description: m.common_error_connection(),
    }),
} as const;

type ToastHandler<K extends NoteActionType> = (data: NoteActionResultData<K>) => void;

type SuccessToastMap = {
  [K in NoteActionType]: ToastHandler<K>;
};

const SUCCESS_TOAST_MAP: SuccessToastMap = {
  favorite: (data) => {
    const { favorite: isFav, title } = data;
    toast.success(isFav ? m.notes_page_toast_favorited() : m.notes_page_toast_unfavorited(), {
      description: (isFav
        ? m.notes_page_toast_favorited_desc
        : m.notes_page_toast_unfavorited_desc)({ title }),
    });
  },
  pin: (data) => {
    const { pinned: isPinned, title } = data;
    toast.success(isPinned ? m.notes_page_toast_pinned() : m.notes_page_toast_unpinned(), {
      description: (isPinned ? m.notes_page_toast_pinned_desc : m.notes_page_toast_unpinned_desc)({
        title,
      }),
    });
  },
  unarchive: (data) => {
    toast.success(m.notes_page_toast_unarchived(), {
      description: m.notes_page_toast_unarchived_desc({ title: data.title }),
    });
  },
  archive: (data) => {
    toast.success(m.notes_page_toast_archived(), {
      description: m.notes_page_toast_archived_desc({ title: data.title }),
    });
  },
  restore: (data) => {
    toast.success(m.notes_page_toast_restored(), {
      description: m.notes_page_toast_restored_desc({ title: data.title }),
    });
  },
  trash: (data) => {
    toast.success(m.notes_page_toast_trashed(), {
      description: m.notes_page_toast_trashed_desc({ title: data.title }),
    });
  },
  delete: () => {
    toast.success(m.notes_page_toast_deleted(), {
      description: m.notes_page_toast_deleted_desc(),
    });
  },
};

interface UseNoteCardOptions {
  onToggleSelect?: (id: string) => void;
  onSelectRange?: (id: string) => void;
  viewMode?: NoteViewMode;
  note: NoteWithDetails;
}

export function useNoteCard({ onToggleSelect, onSelectRange, viewMode, note }: UseNoteCardOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // 1. Mutations
  const { mutate: _execute, isPending } = useMutation({
    onSuccess: ({ data, type }) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      (SUCCESS_TOAST_MAP[type] as ToastHandler<typeof type>)?.(data);
    },
    mutationFn: async (type: NoteActionType) => {
      const data = await executeNoteAction(type, note);
      return { data, type };
    },
    onError: (_, type) => {
      ERROR_TOAST_MAP[type]?.();
    },
  });

  // 2. Computed Values
  const tags = useMemo(() => note.tags ?? [], [note.tags]);
  const visibleTags = useMemo(() => tags.slice(0, MAX_VISIBLE_TAGS), [tags]);
  const remainingTagsCount = Math.max(0, tags.length - MAX_VISIBLE_TAGS);

  const wordCount = useMemo(() => countWordsMarkdownSync(note.content), [note.content]);
  const readTime = useMemo(() => getMarkdownReadTimeSync(note.content), [note.content]);

  const canPinFavorite = viewMode !== 'archive' && viewMode !== 'trash';

  // 3. UI Interactions (Touch & Click)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      onToggleSelect?.(note.id);
    }, 500);
  }, [note.id, onToggleSelect]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-slot="checkbox"]')) return;
      if (e.shiftKey) {
        onSelectRange?.(note.id);
      } else {
        onToggleSelect?.(note.id);
      }
    },
    [note.id, onSelectRange, onToggleSelect],
  );

  const openDetail = () => {
    void navigate({
      search: viewMode && viewMode !== 'active' ? { from: viewMode } : undefined,
      params: { noteId: note.id },
      to: '/notes/$noteId',
    });
  };

  const addNoteAttachment = useChatNoteAttachmentStore((state) => state.add);
  const goToCompanion = useGoToCompanion();

  const includeInChat = useCallback(() => {
    const added = addNoteAttachment(
      buildNoteChatAttachment({
        content: note.content ?? '',
        title: note.title ?? '',
        id: note.id,
      }),
    );
    if (!added) {
      toast.error(m.chat_attachments_max());
      return;
    }
    goToCompanion();
  }, [addNoteAttachment, goToCompanion, note.content, note.id, note.title]);

  const copyContent = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(note.content ?? '');
      toast.success(m.notes_page_toast_copy_content());
    } catch {
      toast.error(m.notes_page_toast_copy_content_failed(), {
        description: m.common_error_connection(),
      });
    }
  }, [note.content]);

  const exportNote = () => {
    exportMarkdown(note);
  };

  const previewContent = useMemo(() => {
    if (!note.content) return '';
    return note.content.length > PREVIEW_CHAR_LIMIT
      ? note.content.slice(0, PREVIEW_CHAR_LIMIT)
      : note.content;
  }, [note.content]);

  const formattedUpdatedAt = useMemo(
    () => format(new Date(note.updatedAt), 'MMM d, yyyy HH:mm'),
    [note.updatedAt],
  );

  const execute = async (type: NoteActionType) => {
    if (type === 'delete') {
      const ok = await confirm({
        description: m.notes_page_delete_desc({ title: note.title }),
        confirmText: m.notes_page_delete_confirm(),
        cancelText: m.notes_page_delete_cancel(),
        title: m.notes_page_delete_title(),
        variant: 'destructive',
      });

      if (!ok) return;
    }

    _execute(type);
  };

  return {
    actions: {
      handleTouchStart,
      handleCardClick,
      handleTouchEnd,
      includeInChat,
      copyContent,
      exportNote,
      openDetail,
      execute,
    },
    metrics: {
      remainingTagsCount,
      visibleTags,
      wordCount,
      readTime,
    },
    state: {
      tagsCount: tags.length,
      canPinFavorite,
    },
    data: {
      formattedUpdatedAt,
      previewContent,
    },
    status: {
      isPending,
    },
  };
}
