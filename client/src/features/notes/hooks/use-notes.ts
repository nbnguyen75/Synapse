import type { NoteTab } from '@/features/notes/types';
import type { Note } from '@/features/notes/types';
import type { FormEvent } from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { Route } from '@/routes/_app/notes';

import {
   getNotes,
   createNote,
   updateNote,
   deleteNote,
} from '@/features/notes/api';
import { generateAiTitle } from '@/features/notes/lib/ai-title';
import { type NotesSearch } from '@/features/notes/constants';

import { usePagination } from '@/hooks/use-pagination';
import { useSearchInput } from '@/hooks/use-search';

import { m } from '@/paraglide/messages';

export default function useNotes() {
   const queryClient = useQueryClient();
   const navigate = Route.useNavigate();
   const searchParams = Route.useSearch();

   const q = searchParams.q;
   const selectedTag = searchParams.tag;
   const sortBy = searchParams.sort;
   const currentPage = searchParams.page;
   const pageSize = searchParams.pageSize;
   const view = searchParams.view || 'active';
   const startDate = searchParams.startDate || '';
   const endDate = searchParams.endDate || '';

   const searchInput = useSearchInput({ defaultValue: q, delay: 300 });

   const updateSearchParam = useCallback(
      (key: string, value: string | number) => {
         void navigate({
            search: (prev: NotesSearch) => ({ ...prev, [key]: value, page: 1 }),
            to: '/notes',
         });
      },
      [navigate],
   );

   useEffect(() => {
      if (searchInput.debouncedValue !== q) {
         void navigate({
            search: (prev: NotesSearch) => ({
               ...prev,
               q: searchInput.debouncedValue,
               page: 1,
            }),
            to: '/notes',
         });
      }
   }, [searchInput.debouncedValue, q, navigate]);

   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

   const [activeNote, setActiveNote] = useState<Note | null>(null);
   const [noteTitle, setNoteTitle] = useState('');
   const [noteContent, setNoteContent] = useState('');
   const [noteTags, setNoteTags] = useState('');
   const [createTab, setCreateTab] = useState<NoteTab>('write');
   const [editTab, setEditTab] = useState<NoteTab>('write');
   const [isSplitCreate, setIsSplitCreate] = useState(false);
   const [isSplitEdit, setIsSplitEdit] = useState(false);
   const [saveState, setSaveState] = useState<'saving' | null>(null);

   const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
   const [viewingNoteForDetails, setViewingNoteForDetails] =
      useState<Note | null>(null);

   const { data: notes = [], isLoading } = useQuery<Note[]>({
      queryKey: ['notes'],
      queryFn: getNotes,
   });

   const allTags = useMemo(
      () => Array.from(new Set(notes.flatMap((n) => n.tags || []))),
      [notes],
   );

   const filteredNotes = useMemo(
      () =>
         notes.filter((note) => {
            const matchesView =
               view === 'archived' ? note.archived : !note.archived;
            if (!matchesView) return false;
            const matchesSearch =
               !q ||
               note.title.toLowerCase().includes(q.toLowerCase()) ||
               note.content.toLowerCase().includes(q.toLowerCase());
            const matchesTag =
               !selectedTag || (note.tags && note.tags.includes(selectedTag));
            const matchesDate =
               (!startDate ||
                  new Date(note.createdAt) >= new Date(startDate)) &&
               (!endDate ||
                  new Date(note.createdAt) <= new Date(endDate + 'T23:59:59'));
            return matchesSearch && matchesTag && matchesDate;
         }),
      [notes, view, q, selectedTag, startDate, endDate],
   );

   const sortedNotes = useMemo(() => {
      return [...filteredNotes].sort((a, b) => {
         const aPinned = a.pinned ? 1 : 0;
         const bPinned = b.pinned ? 1 : 0;
         if (aPinned !== bPinned) return bPinned - aPinned;
         switch (sortBy) {
            case 'updatedAt_asc':
               return (
                  new Date(a.updatedAt).getTime() -
                  new Date(b.updatedAt).getTime()
               );
            case 'createdAt_desc':
               return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
               );
            case 'createdAt_asc':
               return (
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
               );
            case 'title_asc':
               return a.title.localeCompare(b.title);
            case 'title_desc':
               return b.title.localeCompare(a.title);
            case 'readTime_asc': {
               const aw = (a.content || '')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
               const bw = (b.content || '')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
               return aw - bw;
            }
            case 'readTime_desc': {
               const aw = (a.content || '')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
               const bw = (b.content || '')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
               return bw - aw;
            }
            case 'updatedAt_desc':
            default:
               return (
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
               );
         }
      });
   }, [filteredNotes, sortBy]);

   const pagination = usePagination({
      totalItems: sortedNotes.length,
      initialPage: currentPage,
      initialSize: pageSize,
   });

   const paginatedNotes = sortedNotes.slice(
      pagination.startIndex,
      pagination.endIndex,
   );

   useEffect(() => {
      if (pagination.currentPage !== currentPage) {
         void navigate({
            search: (prev: NotesSearch) => ({
               ...prev,
               page: pagination.currentPage,
            }),
            to: '/notes',
         });
      }
   }, [pagination.currentPage, currentPage, navigate]);

   useEffect(() => {
      if (pagination.pageSize !== pageSize) {
         void navigate({
            search: (prev: NotesSearch) => ({
               ...prev,
               pageSize: pagination.pageSize,
               page: 1,
            }),
            to: '/notes',
         });
      }
   }, [pagination.pageSize, pageSize, navigate]);

   const isUnsaved = useMemo(() => {
      if (!activeNote) return false;
      const tagsArr = noteTags
         .split(',')
         .map((t) => t.trim())
         .filter(Boolean);
      return (
         noteTitle !== activeNote.title ||
         noteContent !== activeNote.content ||
         JSON.stringify(tagsArr) !== JSON.stringify(activeNote.tags || [])
      );
   }, [activeNote, noteTitle, noteContent, noteTags]);

   const displayStatus: 'saved' | 'saving' | 'unsaved' = isUnsaved
      ? 'unsaved'
      : (saveState ?? 'saved');

   const createMutation = useMutation({
      onMutate: async (newData) => {
         await queryClient.cancelQueries({ queryKey: ['notes'] });
         const prev = queryClient.getQueryData<Note[]>(['notes']);
         const optimistic: Note = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: `note_temp_${Date.now()}`,
            content: newData.content,
            title: newData.title,
            tags: newData.tags,
            userId: 'usr_01',
            pinned: false,
         };
         queryClient.setQueryData<Note[]>(['notes'], (old) => [
            optimistic,
            ...(old || []),
         ]);
         return { prev };
      },
      mutationFn: ({
         content,
         title,
         tags,
      }: {
         content: string;
         tags: string[];
         title: string;
      }) => createNote(title, content, 'usr_01', tags, false),
      onSuccess: (data) => {
         toast.success(m.notes_page_toast_created(), {
            description: m.notes_page_toast_created_desc({ title: data.title }),
         });
      },
      onError: (_err, _v, ctx) => {
         queryClient.setQueryData(['notes'], ctx?.prev);
         toast.error(m.notes_page_toast_create_failed());
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
   });

   const updateMutation = useMutation({
      onMutate: async (vars) => {
         await queryClient.cancelQueries({ queryKey: ['notes'] });
         const prev = queryClient.getQueryData<Note[]>(['notes']);
         queryClient.setQueryData<Note[]>(['notes'], (old) =>
            (old || []).map((note) =>
               note.id === vars.id
                  ? {
                       ...note,
                       archived:
                          vars.archived !== undefined
                             ? vars.archived
                             : note.archived,
                       content:
                          vars.content !== undefined
                             ? vars.content
                             : note.content,
                       pinned:
                          vars.pinned !== undefined ? vars.pinned : note.pinned,
                       title:
                          vars.title !== undefined ? vars.title : note.title,
                       tags: vars.tags !== undefined ? vars.tags : note.tags,
                       updatedAt: new Date().toISOString(),
                    }
                  : note,
            ),
         );
         return { prev };
      },
      mutationFn: (vars: {
         archived?: boolean;
         content?: string;
         pinned?: boolean;
         tags?: string[];
         title?: string;
         id: string;
      }) => updateNote(vars.id, vars),
      onSuccess: (data) => {
         toast.success(m.notes_page_toast_updated(), {
            description: m.notes_page_toast_updated_desc({ title: data.title }),
         });
      },
      onError: (_err, _v, ctx) => {
         queryClient.setQueryData(['notes'], ctx?.prev);
         toast.error(m.notes_page_toast_update_failed());
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
   });

   const deleteMutation = useMutation({
      onMutate: async (id) => {
         await queryClient.cancelQueries({ queryKey: ['notes'] });
         const prev = queryClient.getQueryData<Note[]>(['notes']);
         queryClient.setQueryData<Note[]>(['notes'], (old) =>
            (old || []).filter((n) => n.id !== id),
         );
         return { prev };
      },
      onSuccess: () => {
         toast.success(m.notes_page_toast_deleted(), {
            description: m.notes_page_toast_deleted_desc(),
         });
      },
      onError: (_err, _v, ctx) => {
         queryClient.setQueryData(['notes'], ctx?.prev);
         toast.error(m.notes_page_toast_delete_failed());
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
      mutationFn: (id: string) => deleteNote(id),
   });

   function handleCreateSubmit(e: FormEvent) {
      e.preventDefault();
      if (!noteTitle.trim()) return;
      const tagsArr = noteTags
         .split(',')
         .map((t) => t.trim())
         .filter(Boolean);
      createMutation.mutate({
         content: noteContent,
         title: noteTitle,
         tags: tagsArr,
      });
      setIsCreateOpen(false);
   }

   function openEdit(note: Note) {
      setActiveNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteTags(note.tags ? note.tags.join(', ') : '');
      setEditTab('write');
      setIsSplitEdit(false);
      setSaveState(null);
      setIsEditOpen(true);
   }

   function handleEditSubmit(e: FormEvent) {
      e.preventDefault();
      if (!activeNote) return;
      if (!noteTitle.trim()) return;
      const tagsArr = noteTags
         .split(',')
         .map((t) => t.trim())
         .filter(Boolean);
      updateMutation.mutate({
         content: noteContent,
         id: activeNote.id,
         title: noteTitle,
         tags: tagsArr,
      });
      setIsEditOpen(false);
   }

   function openDetailView(note: Note) {
      setViewingNoteForDetails(note);
      setActiveNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setNoteTags(note.tags ? note.tags.join(', ') : '');
      setEditTab('write');
      setIsSplitEdit(false);
      setSaveState(null);
   }

   function handleCloseDetailView() {
      setViewingNoteForDetails(null);
      setActiveNote(null);
   }

   function handleDetailSaveNow() {
      if (!activeNote) return;
      const tagsArr = noteTags
         .split(',')
         .map((t) => t.trim())
         .filter(Boolean);
      updateMutation.mutate({
         content: noteContent,
         id: activeNote.id,
         title: noteTitle,
         tags: tagsArr,
      });
   }

   function handleDetailDelete() {
      if (!activeNote) return;
      setDeleteTarget(activeNote);
   }

   function handleDeleteConfirm() {
      if (!deleteTarget) return;
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
      if (viewingNoteForDetails) {
         setViewingNoteForDetails(null);
         setActiveNote(null);
      }
   }

   function handleTagClick(tag: string) {
      updateSearchParam('tag', selectedTag === tag ? '' : tag);
   }

   function handleTogglePin(id: string, pinned: boolean) {
      updateMutation.mutate({ pinned, id });
   }

   function handleArchive(id: string, archived: boolean, title: string) {
      updateMutation.mutate({ archived, id });
      toast.success(
         archived
            ? m.notes_page_toast_archived()
            : m.notes_page_toast_unarchived(),
         {
            description: archived
               ? m.notes_page_toast_archived_desc({ title })
               : m.notes_page_toast_unarchived_desc({ title }),
         },
      );
   }

   function handleViewChange(newView: 'active' | 'archived') {
      void navigate({
         search: { ...searchParams, view: newView, page: 1 } as NotesSearch,
         to: '/notes',
      });
   }

   function handleNavigateToNote(note: Note) {
      openDetailView(note);
   }

   function handleChatWithNote(note: Note) {
      navigate({
         search: (prev) => ({
            ...prev,
            q: `Summarize my note "${note.title}"`,
         }),
         to: '/chat',
      });
   }

   function handleApplyTemplate(
      templateTitle: string,
      templateContent: string,
   ) {
      setNoteTitle(
         templateTitle.replace('{date}', new Date().toLocaleDateString()),
      );
      setNoteContent(templateContent);
   }

   function handleCreatePageOpen() {
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      setCreateTab('write');
      setIsSplitCreate(false);
      setIsCreatePageOpen(true);
   }

   function handleCreatePageSubmit() {
      if (!noteTitle.trim()) return;
      const tagsArr = noteTags
         .split(',')
         .map((t) => t.trim())
         .filter(Boolean);
      createMutation.mutate({
         content: noteContent,
         title: noteTitle,
         tags: tagsArr,
      });
      setIsCreatePageOpen(false);
   }

   function handleCreatePageBack() {
      setIsCreatePageOpen(false);
   }

   function handleCreatePageAiTitle() {
      if (!noteContent) return;
      const generated = generateAiTitle(noteContent);
      setNoteTitle(generated);
      toast.success(m.notes_page_ai_title_success());
   }

   useEffect(() => {
      if (!viewingNoteForDetails || !activeNote) return;
      if (!isUnsaved) return;

      const timer = setTimeout(() => {
         if (!noteTitle.trim()) return;
         setSaveState('saving');
         const tagsArr = noteTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
         updateMutation.mutate(
            {
               content: noteContent,
               id: activeNote.id,
               title: noteTitle,
               tags: tagsArr,
            },
            {
               onSuccess: (data) => {
                  setActiveNote(data);
                  setViewingNoteForDetails(data);
                  setSaveState(null);
               },
               onError: () => setSaveState(null),
            },
         );
      }, 1000);

      return () => clearTimeout(timer);
   }, [
      isUnsaved,
      viewingNoteForDetails,
      activeNote,
      noteTitle,
      noteTags,
      noteContent,
   ]);

   useEffect(() => {
      const handleNewNote = (e: Event) => {
         const detail = (e as CustomEvent<{ content?: string; title?: string }>)
            .detail;
         if (detail?.title) setNoteTitle(detail.title);
         if (detail?.content) setNoteContent(detail.content);
         setIsCreateOpen(true);
      };
      const handleEditNoteEvent = (e: Event) => {
         const note = (e as CustomEvent).detail as Note;
         if (note) openEdit(note);
      };

      window.addEventListener('open-new-note-modal', handleNewNote);
      window.addEventListener('open-edit-note', handleEditNoteEvent);
      return () => {
         window.removeEventListener('open-new-note-modal', handleNewNote);
         window.removeEventListener('open-edit-note', handleEditNoteEvent);
      };
   }, []);

   return {
      handleCreatePageAiTitle,
      handleCreatePageSubmit,
      viewingNoteForDetails,
      handleCloseDetailView,
      handleNavigateToNote,
      handleCreatePageOpen,
      handleCreatePageBack,
      handleDetailSaveNow,
      handleDeleteConfirm,
      handleApplyTemplate,
      handleCreateSubmit,
      handleDetailDelete,
      handleChatWithNote,
      updateSearchParam,
      setIsSplitCreate,
      isCreatePageOpen,
      handleEditSubmit,
      handleViewChange,
      setIsCreateOpen,
      setDeleteTarget,
      handleTogglePin,
      setNoteContent,
      setIsSplitEdit,
      paginatedNotes,
      openDetailView,
      handleTagClick,
      isSplitCreate,
      setIsEditOpen,
      displayStatus,
      handleArchive,
      setNoteTitle,
      setCreateTab,
      isCreateOpen,
      deleteTarget,
      selectedTag,
      noteContent,
      setNoteTags,
      isSplitEdit,
      sortedNotes,
      activeNote,
      setEditTab,
      isEditOpen,
      pagination,
      noteTitle,
      createTab,
      isLoading,
      noteTags,
      openEdit,
      editTab,
      allTags,
      sortBy,
      notes,
      view,
      q,
   };
}
