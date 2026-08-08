import type { Note, NoteViewMode } from '@/features/notes/types';

import { useNavigate } from '@tanstack/react-router';

import {
  useTogglePinMutation,
  useToggleFavoriteMutation,
  useArchiveNoteMutation,
  useUnarchiveNoteMutation,
  useTrashNoteMutation,
  useRestoreNoteMutation,
  useDeleteNoteMutation,
} from '@/features/notes/hooks/use-note-mutation';

export function useNoteCardActions(note: Note, viewMode?: NoteViewMode) {
  const navigate = useNavigate();
  const { mutate: togglePin } = useTogglePinMutation();
  const { mutate: toggleFavorite } = useToggleFavoriteMutation();
  const { mutate: archive } = useArchiveNoteMutation();
  const { mutate: unarchive } = useUnarchiveNoteMutation();
  const { mutate: trash } = useTrashNoteMutation();
  const { mutate: restore } = useRestoreNoteMutation();
  const { mutate: deletePermanent } = useDeleteNoteMutation();

  const openDetail = () => {
    void navigate({
      search:
        viewMode && viewMode !== 'active' ? { from: viewMode } : undefined,
      params: { noteId: note.id },
      to: '/notes/$noteId',
    });
  };

  return {
    onPermanentDelete: () => deletePermanent({ params: { id: note.id } }),
    onToggleFavorite: () => toggleFavorite({ params: { id: note.id } }),
    onTogglePin: () => togglePin({ params: { id: note.id } }),
    onUnarchive: () => unarchive({ params: { id: note.id } }),
    onArchive: () => archive({ params: { id: note.id } }),
    onRestore: () => restore({ params: { id: note.id } }),
    onTrash: () => trash({ params: { id: note.id } }),
    openDetail,
  };
}
