import type { Note, NoteViewMode } from '@/features/notes/types';

import { useCallback, useMemo, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
  countWordsMarkdownSync,
  exportMarkdown,
  getMarkdownReadTimeSync,
} from '@/features/notes/service';
import { noteKeys } from '@/features/notes/keys';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

export interface NoteWithDetails extends Note {
  tags?: string[];
}

const MAX_VISIBLE_TAGS = 3;

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

type NoteActionType = keyof typeof NOTE_ACTIONS;

type NoteActionResultData<T extends NoteActionType> = Awaited<
  ReturnType<(typeof NOTE_ACTIONS)[T]>
>['data'];

async function executeNoteAction<T extends NoteActionType>(
  type: T,
  note: Note,
) {
  const actionFn = NOTE_ACTIONS[type];
  if (!actionFn) throw new Error(`Unsupported note action: ${type}`);

  const result = await actionFn(note);
  return result.data;
}

const ERROR_TOAST_MAP = {
  unarchive: () => toast.error(m.notes_page_toast_unarchive_failed()),
  archive: () => toast.error(m.notes_page_toast_archive_failed()),
  favorite: () => toast.error(m.notes_page_toast_update_failed()),
  restore: () => toast.error(m.notes_page_toast_restore_failed()),
  delete: () => toast.error(m.notes_page_toast_delete_failed()),
  trash: () => toast.error(m.notes_page_toast_trash_failed()),
  pin: () => toast.error(m.notes_page_toast_update_failed()),
} as const;

type ToastHandler<K extends NoteActionType> = (
  data: NoteActionResultData<K>,
) => void;

type SuccessToastMap = {
  [K in NoteActionType]: ToastHandler<K>;
};

const SUCCESS_TOAST_MAP: SuccessToastMap = {
  favorite: (data) => {
    const { favorite: isFav, title } = data;
    toast.success(
      isFav ? m.notes_page_toast_favorited() : m.notes_page_toast_unfavorited(),
      {
        description: (isFav
          ? m.notes_page_toast_favorited_desc
          : m.notes_page_toast_unfavorited_desc)({ title }),
      },
    );
  },
  pin: (data) => {
    const { pinned: isPinned, title } = data;
    toast.success(
      isPinned ? m.notes_page_toast_pinned() : m.notes_page_toast_unpinned(),
      {
        description: (isPinned
          ? m.notes_page_toast_pinned_desc
          : m.notes_page_toast_unpinned_desc)({ title }),
      },
    );
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

export function useNoteCard({
  onToggleSelect,
  onSelectRange,
  viewMode,
  note,
}: UseNoteCardOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Mutations
  const { mutate: execute, isPending } = useMutation({
    onSuccess: ({ data, type }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
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
  const tags = note.tags || [];
  const visibleTags = useMemo(() => tags.slice(0, MAX_VISIBLE_TAGS), [tags]);
  const remainingTagsCount = Math.max(0, tags.length - MAX_VISIBLE_TAGS);

  const wordCount = useMemo(
    () => countWordsMarkdownSync(note.content),
    [note.content],
  );
  const readTime = useMemo(
    () => getMarkdownReadTimeSync(note.content),
    [note.content],
  );

  const canPinFavorite = viewMode !== 'archive' && viewMode !== 'trash';

  // 3. UI Interactions (Touch & Click)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      onToggleSelect?.(note.id);
    }, 500);
  }, [note.id, onToggleSelect]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
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
      search:
        viewMode && viewMode !== 'active' ? { from: viewMode } : undefined,
      params: { noteId: note.id },
      to: '/notes/$noteId',
    });
  };

  const exportNote = () => {
    exportMarkdown(note);
  };

  return {
    actions: {
      handleTouchStart,
      handleCardClick,
      handleTouchEnd,
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
    status: {
      isPending,
    },
  };
}
