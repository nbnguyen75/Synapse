import type { Note, NoteVersion } from '@/features/notes/types';
import type { NoteTab } from '@/features/notes/types';
import type { FormEvent, ChangeEvent } from 'react';

import {
   Suspense,
   lazy,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
   notesSearchSchema,
   exportMarkdown,
   getReadTime,
   type NotesSearch,
} from '@/features/notes/constants';
import {
   getNotes,
   createNote,
   updateNote,
   deleteNote,
} from '@/features/notes/api';
import { DeleteAlertDialog } from '@/features/notes/components/delete-alert-dialog';
import { CreateNoteDialog } from '@/features/notes/components/create-note-dialog';
import { TemplateSelector } from '@/features/notes/components/template-selector';
import { NotesPagination } from '@/features/notes/components/notes-pagination';
import { EditNoteDialog } from '@/features/notes/components/edit-note-dialog';
import { VersionHistory } from '@/features/notes/components/version-history';
import { FilterSidebar } from '@/features/notes/components/filter-sidebar';
import { FullPageView } from '@/features/notes/components/full-page-view';
import { NotesHeader } from '@/features/notes/components/notes-header';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { NoteCard } from '@/features/notes/components/note-card';

import { usePagination } from '@/shared/hooks/use-pagination';
import { useSearchInput } from '@/shared/hooks/use-search';

import { generateAiTitle } from '@/shared/lib/ai-title';
import { createTitle } from '@/shared/lib/metadata';

import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from '@/shared/components/ui/empty';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

import {
   FileText,
   Plus,
   ArrowLeft,
   Trash2,
   Download,
   Save,
   Sparkles,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes')({
   head: () => ({
      meta: [{ title: createTitle(m.notes_page_title()) }],
   }),
   validateSearch: notesSearchSchema,
   component: RouteComponent,
});

function RouteComponent() {
   const queryClient = useQueryClient();
   const navigate = Route.useNavigate();
   const searchParams = Route.useSearch();

   const q = searchParams.q;
   const selectedTag = searchParams.tag;
   const sortBy = searchParams.sort;
   const currentPage = searchParams.page;
   const pageSize = searchParams.pageSize;
   const view = searchParams.view || 'active';

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
   const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(
      null,
   );
   const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(
      () => localStorage.getItem('synapse_filter_sidebar') !== 'false',
   );

   useEffect(() => {
      localStorage.setItem(
         'synapse_filter_sidebar',
         String(isFilterSidebarOpen),
      );
   }, [isFilterSidebarOpen]);

   const { data: notes = [], isLoading } = useQuery<Note[]>({
      queryKey: ['notes'],
      queryFn: getNotes,
   });

   const allTags = useMemo(
      () => Array.from(new Set(notes.flatMap((n) => n.tags || []))),
      [notes],
   );

   const filteredNotes = notes.filter((note) => {
      const matchesView = view === 'archived' ? note.archived : !note.archived;
      if (!matchesView) return false;
      const matchesSearch =
         !q ||
         note.title.toLowerCase().includes(q.toLowerCase()) ||
         note.content.toLowerCase().includes(q.toLowerCase());
      const matchesTag =
         !selectedTag || (note.tags && note.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
   });

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

   const displayStatus = isUnsaved ? 'unsaved' : (saveState ?? 'saved');

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
      setSelectedVersion(null);
      setSaveState(null);
   }

   function handleCloseDetailView() {
      setViewingNoteForDetails(null);
      setActiveNote(null);
      setSelectedVersion(null);
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

   function handleSelectVersion(version: NoteVersion | null) {
      setSelectedVersion(version);
   }

   function handleRestoreVersion(version: NoteVersion) {
      setNoteTitle(version.title);
      setNoteContent(version.content);
      toast.success('Version restored');
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

   // Custom event listeners
   useEffect(() => {
      const handleNewNote = (e: Event) => {
         const detail = (e as CustomEvent<{ content?: string; title?: string }>)
            .detail;
         if (detail?.title) setNoteTitle(detail.title);
         if (detail?.content) setNoteContent(detail.content);
         setIsCreateOpen(true);
      };
      const handleEditNote = (e: Event) => {
         const note = (e as CustomEvent).detail as Note;
         if (note) openEdit(note);
      };

      window.addEventListener('open-new-note-modal', handleNewNote);
      window.addEventListener('open-edit-note', handleEditNote);
      return () => {
         window.removeEventListener('open-new-note-modal', handleNewNote);
         window.removeEventListener('open-edit-note', handleEditNote);
      };
   }, []);

   if (isCreatePageOpen) {
      return (
         <FullPageView
            topBar={
               <div className="flex items-center gap-3 border-b px-6 py-3">
                  <Button
                     variant="ghost"
                     size="icon-sm"
                     onClick={handleCreatePageBack}
                  >
                     <ArrowLeft className="size-4" />
                  </Button>
                  <span className="text-sm font-medium">
                     {m.notes_page_create_page_title()}
                  </span>
                  <div className="flex-1" />
                  {noteContent && (
                     <span className="text-[10px] text-muted-foreground">
                        {getReadTime(noteContent)}
                     </span>
                  )}
                  <Button size="sm" onClick={handleCreatePageSubmit}>
                     {m.notes_page_create_create()}
                  </Button>
               </div>
            }
            sidebar={
               <div className="space-y-6">
                  <div>
                     <label className="text-xs font-medium text-muted-foreground">
                        {m.notes_page_create_tags_label()}
                     </label>
                     <input
                        type="text"
                        value={noteTags}
                        onChange={(e) => setNoteTags(e.target.value)}
                        placeholder={m.notes_page_create_tags_placeholder()}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs"
                     />
                     <div className="flex flex-wrap gap-1 mt-2">
                        {allTags.map((tag) => {
                           const has = noteTags
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .includes(tag);
                           return (
                              <Badge
                                 key={tag}
                                 variant={has ? 'default' : 'outline'}
                                 className="cursor-pointer text-[10px]"
                                 onClick={() => {
                                    const current = noteTags
                                       .split(',')
                                       .map((t) => t.trim())
                                       .filter(Boolean);
                                    const next = has
                                       ? current.filter((t) => t !== tag)
                                       : [...current, tag];
                                    setNoteTags(next.join(', '));
                                 }}
                              >
                                 {tag}
                              </Badge>
                           );
                        })}
                     </div>
                  </div>
                  <TemplateSelector onApplyTemplate={handleApplyTemplate} />
               </div>
            }
         >
            <div className="mx-auto max-w-3xl p-6">
               <div className="flex items-center gap-2 mb-4">
                  <input
                     type="text"
                     value={noteTitle}
                     onChange={(e) => setNoteTitle(e.target.value)}
                     placeholder={m.notes_page_create_title_placeholder()}
                     className="flex-1 bg-transparent text-xl font-semibold outline-none"
                  />
                  {noteContent && (
                     <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleCreatePageAiTitle}
                     >
                        <Sparkles className="mr-1 size-3" />
                        {m.notes_page_ai_title()}
                     </Button>
                  )}
               </div>
               <div className="mb-3 flex items-center gap-2 border-b">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                        setCreateTab('write');
                        if (isSplitCreate) setIsSplitCreate(false);
                     }}
                     className={
                        createTab === 'write' && !isSplitCreate
                           ? 'border-b-2 border-primary text-primary rounded-none'
                           : 'text-muted-foreground rounded-none'
                     }
                  >
                     {m.notes_page_create_write()}
                  </Button>
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                        setCreateTab('preview');
                        if (isSplitCreate) setIsSplitCreate(false);
                     }}
                     className={
                        createTab === 'preview' && !isSplitCreate
                           ? 'border-b-2 border-primary text-primary rounded-none'
                           : 'text-muted-foreground rounded-none'
                     }
                  >
                     {m.notes_page_create_preview()}
                  </Button>
                  <div className="flex-1" />
                  <Button
                     variant="outline"
                     size="xs"
                     onClick={() => setIsSplitCreate(!isSplitCreate)}
                  >
                     {m.notes_page_create_split_view()}
                  </Button>
               </div>
               {isSplitCreate ? (
                  <div className="grid grid-cols-2 gap-4">
                     <NoteEditor
                        title={noteTitle}
                        content={noteContent}
                        tags={noteTags}
                        allTags={allTags}
                        tab="write"
                        isSplit={false}
                        onTitleChange={setNoteTitle}
                        onContentChange={setNoteContent}
                        onTagsChange={setNoteTags}
                        onTabChange={() => {}}
                        onSplitToggle={() => {}}
                        titleId="create-page-title"
                        textareaId="create-page-content-split"
                        titlePlaceholder={m.notes_page_create_title_placeholder()}
                        contentPlaceholder={m.notes_page_create_content_placeholder()}
                     />
                  </div>
               ) : createTab === 'write' ? (
                  <LexicalEditorInline
                     value={noteContent}
                     onChange={setNoteContent}
                     id="create-page-content"
                  />
               ) : (
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm min-h-50">
                     <MarkdownPreview content={noteContent} />
                  </div>
               )}
            </div>
         </FullPageView>
      );
   }

   if (viewingNoteForDetails) {
      return (
         <FullPageView
            topBar={
               <div className="flex items-center gap-3 border-b px-6 py-3">
                  <Button
                     variant="ghost"
                     size="icon-sm"
                     onClick={handleCloseDetailView}
                  >
                     <ArrowLeft className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                     {m.notes_page_detail_title()}
                  </span>
                  <div className="flex-1" />
                  {noteContent && (
                     <span className="text-[10px] text-muted-foreground">
                        {getReadTime(noteContent)}
                     </span>
                  )}
                  <span
                     className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        displayStatus === 'saved'
                           ? 'bg-emerald-500/10 text-emerald-600'
                           : displayStatus === 'saving'
                             ? 'bg-amber-500/10 text-amber-600'
                             : 'bg-muted text-muted-foreground'
                     }`}
                  >
                     <span
                        className={`size-1.5 rounded-full ${
                           displayStatus === 'saved'
                              ? 'bg-emerald-500'
                              : displayStatus === 'saving'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-muted-foreground/40'
                        }`}
                     />
                     {displayStatus === 'saved'
                        ? m.notes_page_edit_saved()
                        : displayStatus === 'saving'
                          ? m.notes_page_edit_saving()
                          : m.notes_page_edit_unsaved()}
                  </span>
                  <Button
                     variant="outline"
                     size="icon-sm"
                     onClick={() =>
                        exportMarkdown(noteTitle, noteContent || '')
                     }
                  >
                     <Download className="size-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="icon-sm"
                     onClick={handleDetailDelete}
                  >
                     <Trash2 className="size-4" />
                  </Button>
                  <Button size="sm" onClick={handleDetailSaveNow}>
                     <Save className="mr-1 size-4" />
                     {m.notes_page_detail_save_now()}
                  </Button>
               </div>
            }
            sidebar={
               <div className="space-y-6">
                  <div>
                     <label className="text-xs font-medium text-muted-foreground">
                        {m.notes_page_create_tags_label()}
                     </label>
                     <input
                        type="text"
                        value={noteTags}
                        onChange={(e) => setNoteTags(e.target.value)}
                        placeholder={m.notes_page_create_tags_placeholder()}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs"
                     />
                     <div className="flex flex-wrap gap-1 mt-2">
                        {allTags.map((tag) => {
                           const has = noteTags
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .includes(tag);
                           return (
                              <Badge
                                 key={tag}
                                 variant={has ? 'default' : 'outline'}
                                 className="cursor-pointer text-[10px]"
                                 onClick={() => {
                                    const current = noteTags
                                       .split(',')
                                       .map((t) => t.trim())
                                       .filter(Boolean);
                                    const next = has
                                       ? current.filter((t) => t !== tag)
                                       : [...current, tag];
                                    setNoteTags(next.join(', '));
                                 }}
                              >
                                 {tag}
                              </Badge>
                           );
                        })}
                     </div>
                  </div>
                  <TemplateSelector onApplyTemplate={handleApplyTemplate} />
                  <VersionHistory
                     versions={activeNote?.versions || []}
                     selectedVersion={selectedVersion}
                     onSelectVersion={handleSelectVersion}
                     onRestoreVersion={handleRestoreVersion}
                  />
               </div>
            }
         >
            <div className="mx-auto max-w-3xl p-6">
               <div className="flex items-center gap-2 mb-4">
                  <input
                     type="text"
                     value={noteTitle}
                     onChange={(e) => setNoteTitle(e.target.value)}
                     placeholder={m.notes_page_create_title_placeholder()}
                     className="flex-1 bg-transparent text-xl font-semibold outline-none"
                  />
                  {noteContent && (
                     <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleCreatePageAiTitle}
                     >
                        <Sparkles className="mr-1 size-3" />
                        {m.notes_page_ai_title()}
                     </Button>
                  )}
               </div>
               <div className="mb-3 flex items-center gap-2 border-b">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                        setEditTab('write');
                        if (isSplitEdit) setIsSplitEdit(false);
                     }}
                     className={
                        editTab === 'write' && !isSplitEdit
                           ? 'border-b-2 border-primary text-primary rounded-none'
                           : 'text-muted-foreground rounded-none'
                     }
                  >
                     {m.notes_page_edit_write()}
                  </Button>
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                        setEditTab('preview');
                        if (isSplitEdit) setIsSplitEdit(false);
                     }}
                     className={
                        editTab === 'preview' && !isSplitEdit
                           ? 'border-b-2 border-primary text-primary rounded-none'
                           : 'text-muted-foreground rounded-none'
                     }
                  >
                     {m.notes_page_edit_preview()}
                  </Button>
                  <div className="flex-1" />
                  <Button
                     variant="outline"
                     size="xs"
                     onClick={() => setIsSplitEdit(!isSplitEdit)}
                  >
                     {m.notes_page_create_split_view()}
                  </Button>
               </div>
               {isSplitEdit ? (
                  <div className="grid grid-cols-2 gap-4">
                     <NoteEditor
                        title={noteTitle}
                        content={noteContent}
                        tags={noteTags}
                        allTags={allTags}
                        tab="write"
                        isSplit={false}
                        onTitleChange={setNoteTitle}
                        onContentChange={setNoteContent}
                        onTagsChange={setNoteTags}
                        onTabChange={() => {}}
                        onSplitToggle={() => {}}
                        titleId="edit-page-title"
                        textareaId="details-note-content-split"
                        titlePlaceholder={m.notes_page_edit_title_placeholder()}
                        contentPlaceholder={m.notes_page_edit_content_placeholder()}
                     />
                  </div>
               ) : editTab === 'write' ? (
                  <LexicalEditorInline
                     value={noteContent}
                     onChange={setNoteContent}
                     id="details-note-content"
                  />
               ) : (
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm min-h-[200px]">
                     <MarkdownPreview content={noteContent} />
                  </div>
               )}
            </div>
         </FullPageView>
      );
   }

   return (
      <div className="flex h-full flex-col overflow-hidden">
         <NotesHeader
            searchValue={searchInput.value}
            sortBy={sortBy}
            onSearchChange={(v) =>
               searchInput.setValue({
                  target: { value: v },
               } as ChangeEvent<HTMLInputElement>)
            }
            onSortChange={(value) => updateSearchParam('sort', value)}
            onCreateClick={handleCreatePageOpen}
            onToggleFilter={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            isFilterOpen={isFilterSidebarOpen}
            view={view}
            onViewChange={handleViewChange}
         />

         <div className="flex flex-1 overflow-hidden">
            <FilterSidebar
               allTags={allTags}
               selectedTag={selectedTag}
               onTagClick={handleTagClick}
               onClearFilter={() => updateSearchParam('tag', '')}
               onNavigateToNote={handleNavigateToNote}
               notes={notes}
               isOpen={isFilterSidebarOpen}
               onToggle={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
               <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
                  {isLoading ? (
                     <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                           <div
                              key={i}
                              className="rounded-xl border-none bg-background shadow-flat-sm p-4"
                           >
                              <Skeleton className="mb-1 h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                           </div>
                        ))}
                     </div>
                  ) : sortedNotes.length === 0 ? (
                     <Empty className="py-20">
                        <EmptyHeader>
                           <EmptyMedia variant="icon">
                              <FileText className="h-5 w-5" />
                           </EmptyMedia>
                           <EmptyTitle>
                              {q || selectedTag
                                 ? m.notes_page_no_results()
                                 : view === 'archived'
                                   ? m.notes_page_no_notes_archived()
                                   : m.notes_page_no_notes()}
                           </EmptyTitle>
                           <EmptyDescription>
                              {q || selectedTag
                                 ? ''
                                 : view === 'archived'
                                   ? m.notes_page_no_notes_archived_desc()
                                   : m.notes_page_no_notes_desc()}
                           </EmptyDescription>
                        </EmptyHeader>
                        {!q && !selectedTag && view !== 'archived' && (
                           <EmptyContent>
                              <Button onClick={handleCreatePageOpen}>
                                 <Plus className="h-4 w-4" />
                                 {m.notes_page_create()}
                              </Button>
                           </EmptyContent>
                        )}
                     </Empty>
                  ) : (
                     <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
                        {paginatedNotes.map((note) => (
                           <NoteCard
                              key={note.id}
                              note={note}
                              onEdit={openEdit}
                              onDelete={(n) => {
                                 setDeleteTarget(n);
                              }}
                              onTogglePin={handleTogglePin}
                              onArchive={handleArchive}
                              onTagClick={handleTagClick}
                              onOpenDetail={openDetailView}
                              onChatWithNote={handleChatWithNote}
                           />
                        ))}
                     </div>
                  )}
               </div>

               {sortedNotes.length > 0 && (
                  <NotesPagination
                     currentPage={pagination.currentPage}
                     totalPages={pagination.totalPages}
                     totalItems={sortedNotes.length}
                     startIndex={pagination.startIndex}
                     endIndex={pagination.endIndex}
                     pageSize={pagination.pageSize}
                     isFirstPage={pagination.isFirstPage}
                     isLastPage={pagination.isLastPage}
                     onFirstPage={pagination.firstPage}
                     onPrevPage={pagination.prevPage}
                     onNextPage={pagination.nextPage}
                     onLastPage={pagination.lastPage}
                     onPageSizeChange={pagination.setPageSize}
                  />
               )}
            </div>
         </div>

         <CreateNoteDialog
            isOpen={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            noteTitle={noteTitle}
            noteContent={noteContent}
            noteTags={noteTags}
            createTab={createTab}
            isSplitCreate={isSplitCreate}
            allTags={allTags}
            onTitleChange={setNoteTitle}
            onContentChange={setNoteContent}
            onTagsChange={setNoteTags}
            onTabChange={setCreateTab}
            onSplitToggle={() => setIsSplitCreate((s) => !s)}
            onSubmit={handleCreateSubmit}
         />

         <EditNoteDialog
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
            noteTitle={noteTitle}
            noteContent={noteContent}
            noteTags={noteTags}
            editTab={editTab}
            isSplitEdit={isSplitEdit}
            saveStatus={displayStatus}
            allTags={allTags}
            onTitleChange={setNoteTitle}
            onContentChange={setNoteContent}
            onTagsChange={setNoteTags}
            onTabChange={setEditTab}
            onSplitToggle={() => setIsSplitEdit((s) => !s)}
            onSubmit={handleEditSubmit}
         />

         <DeleteAlertDialog
            deleteTarget={deleteTarget}
            onOpenChange={(open) => {
               if (!open) setDeleteTarget(null);
            }}
            onConfirm={handleDeleteConfirm}
         />
      </div>
   );
}

const LexicalEditorLazy = lazy(
   () => import('@/shared/components/editor/lexical-editor'),
);
const ReactMarkdownLazy = lazy(() => import('react-markdown'));

function LexicalEditorInline({
   onChange,
   value,
   id,
}: {
   onChange: (v: string) => void;
   value: string;
   id?: string;
}) {
   return (
      <Suspense
         fallback={
            <div className="h-[200px] rounded-lg border bg-muted/30 animate-pulse" />
         }
      >
         <LexicalEditorLazy
            value={value}
            onChange={onChange}
            id={id}
            placeholder="Write your note here (Markdown supported)..."
         />
      </Suspense>
   );
}

function MarkdownPreview({ content }: { content: string }) {
   return (
      <Suspense
         fallback={
            <div className="text-muted-foreground">Loading preview...</div>
         }
      >
         <ReactMarkdownLazy>
            {content || '*No content to preview.*'}
         </ReactMarkdownLazy>
      </Suspense>
   );
}
