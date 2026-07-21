import type { Note } from '@/types';

import {
   useCallback,
   useEffect,
   useMemo,
   useState,
   type ChangeEvent,
   type FormEvent,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';
import * as React from 'react';

import { format } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

import { usePagination } from '@/hooks/use-pagination';
import { useSearchInput } from '@/hooks/use-search';

import { createTitle } from '@/lib/metadata';

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from '@/components/ui/empty';
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import {
   NativeSelect,
   NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
   Plus,
   Search,
   Trash2,
   Edit3,
   FileText,
   Clock,
   MoreVertical,
   Pin,
   Eye,
   FileDown,
   Bold,
   Italic,
   List,
   Heading,
   ChevronsLeft,
   ChevronsRight,
   ChevronLeft,
   ChevronRight,
   X,
} from 'lucide-react';

import { deleteNote, getNotes, createNote, updateNote } from '@/api/notes';
import * as M from '@/paraglides/messages';

const notesSearchSchema = z.object({
   sort: z.string().optional().default('updatedAt_desc'),
   pageSize: z.number().optional().default(10),
   tag: z.string().optional().default(''),
   page: z.number().optional().default(1),
   q: z.string().optional().default(''),
});

export const Route = createFileRoute('/_app/notes')({
   validateSearch: (search: Record<string, unknown>) =>
      notesSearchSchema.parse(search),
   head: () => ({
      meta: [{ title: createTitle(M.notes_page_title()) }],
   }),
   component: RouteComponent,
});

const TAG_COLORS = [
   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
   'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
   'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
   'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800',
   'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
];

function getTagColor(tag: string): string {
   let hash = 0;
   for (const char of tag) {
      hash = (hash << 5) - hash + char.charCodeAt(0);
      hash |= 0;
   }
   return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function formatDate(dateStr: string): string {
   return format(new Date(dateStr), 'MMM d, yyyy');
}

function getReadTime(content: string): string {
   const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
   const minutes = Math.max(1, Math.ceil(words / 200));
   return M.notes_page_card_read_time({ minutes: String(minutes) });
}

function exportMarkdown(title: string, content: string) {
   const blob = new Blob([`# ${title.trim()}\n\n${content || ''}`], {
      type: 'text/markdown;charset=utf-8;',
   });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = `${
      title
         .trim()
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-') || 'note'
   }.md`;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   toast.success(M.notes_page_toast_exported());
}

const SORT_OPTIONS = [
   { labelKey: 'notes_page_sort_updated' as const, value: 'updatedAt_desc' },
   {
      labelKey: 'notes_page_sort_created_new' as const,
      value: 'createdAt_desc',
   },
   { labelKey: 'notes_page_sort_created_old' as const, value: 'createdAt_asc' },
   { labelKey: 'notes_page_sort_title_az' as const, value: 'title_asc' },
   { labelKey: 'notes_page_sort_title_za' as const, value: 'title_desc' },
   { labelKey: 'notes_page_sort_read_long' as const, value: 'readTime_desc' },
   { labelKey: 'notes_page_sort_read_short' as const, value: 'readTime_asc' },
] as const;

type NoteTab = 'write' | 'preview';

interface NoteEditorProps {
   onContentChange: (v: string) => void;
   onTitleChange: (v: string) => void;
   onTagsChange: (v: string) => void;
   onTabChange: (t: NoteTab) => void;
   contentPlaceholder: string;
   onSplitToggle: () => void;
   titlePlaceholder: string;
   textareaId: string;
   allTags: string[];
   isSplit: boolean;
   content: string;
   titleId: string;
   title: string;
   tags: string;
   tab: NoteTab;
}

function NoteEditor({
   contentPlaceholder,
   titlePlaceholder,
   onContentChange,
   onTitleChange,
   onSplitToggle,
   onTagsChange,
   onTabChange,
   textareaId,
   content,
   allTags,
   isSplit,
   titleId,
   title,
   tags,
   tab,
}: NoteEditorProps) {
   const formatToolbar = (textareaId: string) => (
      <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 px-1.5 py-0.5 shadow-xs">
         {(
            [
               ['bold', '**', '**'],
               ['italic', '*', '*'],
               ['list', '- ', ''],
               ['heading', '## ', ''],
            ] as const
         ).map(([type, before, after]) => (
            <Button
               key={type}
               variant="ghost"
               size="icon-xs"
               type="button"
               onClick={() => {
                  const ta = document.getElementById(
                     textareaId,
                  ) as HTMLTextAreaElement | null;
                  if (!ta) return;
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const sel = ta.value.substring(start, end);
                  const replacement = `${before}${sel || type}${after}`;
                  ta.setRangeText(replacement, start, end, 'select');
                  ta.dispatchEvent(new Event('input', { bubbles: true }));
               }}
               className="text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
            >
               {type === 'bold' && <Bold className="h-3 w-3" />}
               {type === 'italic' && <Italic className="h-3 w-3" />}
               {type === 'list' && <List className="h-3 w-3" />}
               {type === 'heading' && <Heading className="h-3 w-3" />}
            </Button>
         ))}
      </div>
   );

   const tagsInput = (
      <div className="space-y-1.5">
         <Label className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{M.notes_page_create_tags_label()}</span>
            <span className="text-[10px] text-muted-foreground/60">
               {M.notes_page_create_tags_hint()}
            </span>
         </Label>
         <Input
            type="text"
            placeholder={M.notes_page_create_tags_placeholder()}
            value={tags}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
               onTagsChange(e.target.value)
            }
            className="h-9 rounded-lg"
         />
         {allTags.length > 0 && (
            <div className="mt-1">
               <div className="mb-1 text-[10px] font-medium text-muted-foreground/60">
                  {M.notes_page_create_quick_tags()}
               </div>
               <div className="flex max-h-16 flex-wrap gap-1 overflow-y-auto scrollbar-none">
                  {allTags.map((tag) => {
                     const currentTags = tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                     const has = currentTags.includes(tag);
                     return (
                        <Button
                           key={tag}
                           variant="outline"
                           size="xs"
                           type="button"
                           onClick={() => {
                              const next = has
                                 ? currentTags.filter((t) => t !== tag)
                                 : [...currentTags, tag];
                              onTagsChange(next.join(', '));
                           }}
                           className={`cursor-pointer ${
                              has
                                 ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                 : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                           }`}
                        >
                           {tag}
                        </Button>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );

   return (
      <div className="space-y-4">
         <div className="mb-4 flex items-center justify-between border-b border-border">
            <div className="flex">
               <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                     onTabChange('write');
                     if (isSplit) onSplitToggle();
                  }}
                  className={`cursor-pointer ${
                     tab === 'write' && !isSplit
                        ? 'border-b-2 border-primary text-primary'
                        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                  }`}
               >
                  <Edit3 className="h-3.5 w-3.5" />
                  {M.notes_page_create_write()}
               </Button>
               <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                     onTabChange('preview');
                     if (isSplit) onSplitToggle();
                  }}
                  className={`cursor-pointer ${
                     tab === 'preview' && !isSplit
                        ? 'border-b-2 border-primary text-primary'
                        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                  }`}
               >
                  <Eye className="h-3.5 w-3.5" />
                  {M.notes_page_create_preview()}
               </Button>
            </div>
            <Button
               variant="outline"
               size="xs"
               type="button"
               onClick={onSplitToggle}
               className={`cursor-pointer ${
                  isSplit ? 'border-primary/30 bg-primary/10 text-primary' : ''
               }`}
            >
               <span>{M.notes_page_create_split_view()}</span>
            </Button>
         </div>

         <div className="space-y-1.5">
            <Label
               className="text-xs font-semibold text-muted-foreground"
               htmlFor={titleId}
            >
               {M.notes_page_create_title_label()}
            </Label>
            <Input
               id={titleId}
               type="text"
               placeholder={titlePlaceholder}
               value={title}
               onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onTitleChange(e.target.value)
               }
               className="h-9 rounded-lg"
               required
            />
         </div>

         {isSplit ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                     <Label
                        className="text-xs font-semibold text-muted-foreground"
                        htmlFor={textareaId}
                     >
                        {M.notes_page_create_content_label()}
                     </Label>
                     {formatToolbar(textareaId)}
                  </div>
                  <Textarea
                     id={textareaId}
                     placeholder={contentPlaceholder}
                     value={content}
                     onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        onContentChange(e.target.value)
                     }
                     className="h-[320px] rounded-lg font-mono text-sm"
                  />
               </div>
               <div className="flex flex-col space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                     {M.notes_page_create_preview()}
                  </Label>
                  <div className="h-[320px] max-h-[320px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed">
                     <ReactMarkdown>
                        {content || M.notes_page_create_empty_preview()}
                     </ReactMarkdown>
                  </div>
               </div>
            </div>
         ) : (
            <>
               {tab === 'write' ? (
                  <div className="space-y-1.5">
                     <div className="flex items-center justify-between">
                        <Label
                           className="text-xs font-semibold text-muted-foreground"
                           htmlFor={textareaId}
                        >
                           {M.notes_page_create_content_label()}
                        </Label>
                        {formatToolbar(textareaId)}
                     </div>
                     <Textarea
                        id={textareaId}
                        placeholder={contentPlaceholder}
                        value={content}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                           onContentChange(e.target.value)
                        }
                        rows={6}
                        className="rounded-lg text-sm"
                     />
                  </div>
               ) : (
                  <div className="space-y-1.5">
                     <Label className="text-xs font-semibold text-muted-foreground">
                        {M.notes_page_create_content_label()}
                     </Label>
                     <div className="min-h-[140px] max-h-[220px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed">
                        <ReactMarkdown>
                           {content || M.notes_page_create_empty_preview_tab()}
                        </ReactMarkdown>
                     </div>
                  </div>
               )}
            </>
         )}

         {tagsInput}
      </div>
   );
}

function RouteComponent() {
   const queryClient = useQueryClient();
   const navigate = useNavigate({ from: Route.fullPath });
   const searchParams = Route.useSearch();

   const q = searchParams.q;
   const selectedTag = searchParams.tag;
   const sortBy = searchParams.sort;
   const currentPage = searchParams.page;
   const pageSize = searchParams.pageSize;

   const searchInput = useSearchInput({ defaultValue: q, delay: 300 });

   const updateSearchParam = useCallback(
      (key: string, value: string | number) => {
         void navigate({
            search: (prev) => ({ ...prev, [key]: value, page: 1 }),
         });
      },
      [navigate],
   );

   useEffect(() => {
      if (searchInput.debouncedValue !== q) {
         void navigate({
            search: (prev) => ({
               ...prev,
               q: searchInput.debouncedValue,
               page: 1,
            }),
         });
      }
   }, [searchInput.debouncedValue, q, navigate]);

   // Modal state
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isEditOpen, setIsEditOpen] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

   // Editor state
   const [activeNote, setActiveNote] = useState<Note | null>(null);
   const [noteTitle, setNoteTitle] = useState('');
   const [noteContent, setNoteContent] = useState('');
   const [noteTags, setNoteTags] = useState('');
   const [createTab, setCreateTab] = useState<NoteTab>('write');
   const [editTab, setEditTab] = useState<NoteTab>('write');
   const [isSplitCreate, setIsSplitCreate] = useState(false);
   const [isSplitEdit, setIsSplitEdit] = useState(false);
   const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
      'saved',
   );

   // Fetch notes
   const { data: notes = [], isLoading } = useQuery<Note[]>({
      queryKey: ['notes'],
      queryFn: getNotes,
   });

   // All unique tags
   const allTags = useMemo(
      () => Array.from(new Set(notes.flatMap((n) => n.tags || []))),
      [notes],
   );

   // Filter + sort
   const filteredNotes = notes.filter((note) => {
      const matchesSearch =
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

   // Pagination
   const pagination = usePagination({
      totalItems: sortedNotes.length,
      initialPage: currentPage,
      initialSize: pageSize,
   });

   const paginatedNotes = sortedNotes.slice(
      pagination.startIndex,
      pagination.endIndex,
   );

   // Sync URL page/pageSize to pagination when they change
   useEffect(() => {
      if (pagination.currentPage !== currentPage) {
         void navigate({
            search: (prev) => ({ ...prev, page: pagination.currentPage }),
         });
      }
   }, [pagination.currentPage, currentPage, navigate]);

   useEffect(() => {
      if (pagination.pageSize !== pageSize) {
         void navigate({
            search: (prev) => ({
               ...prev,
               pageSize: pagination.pageSize,
               page: 1,
            }),
         });
      }
   }, [pagination.pageSize, pageSize, navigate]);

   // Mutations
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
         toast.success(M.notes_page_toast_created(), {
            description: M.notes_page_toast_created_desc({ title: data.title }),
         });
      },
      onError: (_err, _v, ctx) => {
         queryClient.setQueryData(['notes'], ctx?.prev);
         toast.error(M.notes_page_toast_create_failed());
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
         toast.success(M.notes_page_toast_updated(), {
            description: M.notes_page_toast_updated_desc({ title: data.title }),
         });
      },
      onError: (_err, _v, ctx) => {
         queryClient.setQueryData(['notes'], ctx?.prev);
         toast.error(M.notes_page_toast_update_failed());
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
         toast.success(M.notes_page_toast_deleted(), {
            description: M.notes_page_toast_deleted_desc(),
         });
      },
      onError: (_err, _v, ctx) => {
         queryClient.setQueryData(['notes'], ctx?.prev);
         toast.error(M.notes_page_toast_delete_failed());
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
      mutationFn: (id: string) => deleteNote(id),
   });

   // Handlers
   function openCreate() {
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      setCreateTab('write');
      setIsSplitCreate(false);
      setIsCreateOpen(true);
   }

   function handleCreateSubmit(e: FormEvent) {
      e.preventDefault();
      if (!noteTitle.trim()) {
         toast.warning(M.notes_page_toast_title_required());
         return;
      }
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
      setSaveStatus('saved');
      setIsEditOpen(true);
   }

   function handleEditSubmit(e: FormEvent) {
      e.preventDefault();
      if (!activeNote) return;
      if (!noteTitle.trim()) {
         toast.warning(M.notes_page_toast_title_required());
         return;
      }
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

   function handleDeleteConfirm() {
      if (!deleteTarget) return;
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
   }

   // Auto-save in edit mode
   useEffect(() => {
      if (!isEditOpen || !activeNote) return;
      const tagsArr = noteTags
         .split(',')
         .map((t) => t.trim())
         .filter(Boolean);
      const titleChanged = noteTitle !== activeNote.title;
      const contentChanged = noteContent !== activeNote.content;
      const tagsChanged =
         JSON.stringify(tagsArr) !== JSON.stringify(activeNote.tags || []);

      const saveStatus = (status: 'saved' | 'saving' | 'unsaved') =>
         setSaveStatus(status);

      if (!titleChanged && !contentChanged && !tagsChanged) {
         saveStatus('saved');
         return;
      }
      saveStatus('unsaved');

      const timer = setTimeout(() => {
         if (!noteTitle.trim()) return;
         setSaveStatus('saving');
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
                  setSaveStatus('saved');
               },
               onError: () => setSaveStatus('unsaved'),
            },
         );
      }, 1000);

      return () => clearTimeout(timer);
   }, [noteTitle, noteContent, noteTags, isEditOpen, activeNote]);

   return (
      <div className="flex h-full flex-col overflow-hidden">
         {/* Header */}
         <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-heading text-xl font-semibold tracking-tight">
               {M.notes_page_title()}
            </h1>

            <div className="flex flex-1 items-center gap-3 sm:justify-end">
               <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                     placeholder={M.notes_page_search_placeholder()}
                     value={searchInput.value}
                     onChange={searchInput.setValue}
                     className="h-9 rounded-lg pl-9"
                  />
                  {searchInput.value && (
                     <Button
                        variant="ghost"
                        size="icon-xs"
                        type="button"
                        onClick={searchInput.clear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                     >
                        <X className="h-3.5 w-3.5" />
                     </Button>
                  )}
               </div>

               <NativeSelect
                  value={sortBy}
                  onChange={(e) => updateSearchParam('sort', e.target.value)}
                  className="h-9"
               >
                  {SORT_OPTIONS.map((opt) => (
                     <NativeSelectOption key={opt.value} value={opt.value}>
                        {M[opt.labelKey]()}
                     </NativeSelectOption>
                  ))}
               </NativeSelect>

               <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  {M.notes_page_create()}
               </Button>
            </div>
         </div>

         {/* Tag filter pills */}
         {allTags.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto border-b border-border px-6 py-2.5 scrollbar-none">
               {selectedTag && (
                  <Button
                     variant="outline"
                     size="xs"
                     type="button"
                     onClick={() => updateSearchParam('tag', '')}
                     className="cursor-pointer"
                  >
                     <X className="h-3 w-3" />
                     Clear
                  </Button>
               )}
               {allTags.map((tag) => (
                  <Button
                     key={tag}
                     variant="outline"
                     size="xs"
                     type="button"
                     onClick={() =>
                        updateSearchParam('tag', selectedTag === tag ? '' : tag)
                     }
                     className={`cursor-pointer ${
                        selectedTag === tag
                           ? 'border-primary bg-primary text-primary-foreground'
                           : ''
                     }`}
                  >
                     {tag}
                  </Button>
               ))}
            </div>
         )}

         {/* Content */}
         <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
            {isLoading ? (
               <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                     <Card
                        key={i}
                        className="border-none bg-background shadow-flat-sm"
                     >
                        <CardHeader className="gap-2">
                           <Skeleton className="mb-1 h-4 w-3/4" />
                           <Skeleton className="h-3 w-1/2" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-3 w-full" />
                           <Skeleton className="mt-1 h-3 w-2/3" />
                        </CardContent>
                     </Card>
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
                           ? M.notes_page_no_results()
                           : M.notes_page_no_notes()}
                     </EmptyTitle>
                     <EmptyDescription>
                        {q || selectedTag ? '' : M.notes_page_no_notes_desc()}
                     </EmptyDescription>
                  </EmptyHeader>
                  {!q && !selectedTag && (
                     <EmptyContent>
                        <Button onClick={openCreate}>
                           <Plus className="h-4 w-4" />
                           {M.notes_page_create()}
                        </Button>
                     </EmptyContent>
                  )}
               </Empty>
            ) : (
               <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
                  {paginatedNotes.map((note) => (
                     <Card
                        key={note.id}
                        className="group border-none bg-background shadow-flat-sm hover:shadow-flat transition-all duration-300 flex flex-col justify-between rounded-xl overflow-hidden"
                     >
                        <CardHeader className="pb-2">
                           <div className="flex items-start gap-2">
                              <button
                                 type="button"
                                 onClick={() =>
                                    updateMutation.mutate({
                                       pinned: !note.pinned,
                                       id: note.id,
                                    })
                                 }
                                 title={
                                    note.pinned
                                       ? M.notes_page_pin_unpin()
                                       : M.notes_page_pin_pin()
                                 }
                                 className={`h-7 w-7 flex items-center justify-center rounded-lg border border-border/10 bg-background hover:shadow-flat-inset cursor-pointer text-neutral-400 dark:text-neutral-500 transition-all shrink-0 ${
                                    note.pinned
                                       ? 'text-primary bg-primary/10 border-primary/20 shadow-flat-inset'
                                       : 'shadow-flat-sm'
                                 }`}
                              >
                                 <Pin
                                    className={`h-3 w-3 ${note.pinned ? 'fill-primary text-primary' : ''}`}
                                 />
                              </button>
                              <CardTitle
                                 className="flex-1 cursor-pointer text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1"
                                 onClick={() => openEdit(note)}
                              >
                                 {note.title}
                              </CardTitle>
                              <DropdownMenu>
                                 <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:shadow-flat-inset border border-transparent hover:border-border/15 cursor-pointer transition-all">
                                    <MoreVertical className="h-4 w-4" />
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent
                                    align="end"
                                    className="w-36"
                                 >
                                    <DropdownMenuItem
                                       onClick={() => openEdit(note)}
                                    >
                                       <Edit3 className="h-3.5 w-3.5" />
                                       {M.notes_page_action_edit()}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                       onClick={() =>
                                          exportMarkdown(
                                             note.title,
                                             note.content,
                                          )
                                       }
                                    >
                                       <FileDown className="h-3.5 w-3.5" />
                                       {M.notes_page_action_export()}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                       onClick={() => {
                                          updateMutation.mutate({
                                             archived: !note.archived,
                                             id: note.id,
                                          });
                                          const isArchiving = !note.archived;
                                          toast.success(
                                             isArchiving
                                                ? M.notes_page_toast_archived()
                                                : M.notes_page_toast_unarchived(),
                                             {
                                                description: isArchiving
                                                   ? M.notes_page_toast_archived_desc(
                                                        { title: note.title },
                                                     )
                                                   : M.notes_page_toast_unarchived_desc(
                                                        { title: note.title },
                                                     ),
                                             },
                                          );
                                       }}
                                    >
                                       <FileText className="h-3.5 w-3.5" />
                                       {note.archived
                                          ? M.notes_page_action_unarchive()
                                          : M.notes_page_action_archive()}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                       className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                       onClick={() => setDeleteTarget(note)}
                                    >
                                       <Trash2 className="h-3.5 w-3.5" />
                                       {M.notes_page_action_delete()}
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </div>
                           <CardDescription className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(note.updatedAt)}</span>
                              <span className="text-border">{'\u2022'}</span>
                              <span>{getReadTime(note.content)}</span>
                           </CardDescription>
                           {note.tags && note.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                 {note.tags.map((tag) => (
                                    <span
                                       key={tag}
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          updateSearchParam(
                                             'tag',
                                             selectedTag === tag ? '' : tag,
                                          );
                                       }}
                                       className={`flex cursor-pointer items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium transition-all ${getTagColor(tag)}`}
                                    >
                                       <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                                       {tag}
                                    </span>
                                 ))}
                              </div>
                           )}
                        </CardHeader>

                        <CardContent className="flex-1 pt-1 pb-4">
                           <p
                              className="cursor-pointer text-xs leading-relaxed text-muted-foreground line-clamp-2 whitespace-pre-line"
                              onClick={() => openEdit(note)}
                           >
                              {note.content}
                           </p>
                        </CardContent>

                        <CardFooter className="pt-3 pb-3 px-6 border-t border-border/10 flex justify-between bg-background/30">
                           <span className="rounded border border-border/10 bg-background/20 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                              {M.notes_page_card_id({
                                 id: note.id.split('_')[1],
                              })}
                           </span>
                        </CardFooter>
                     </Card>
                  ))}
               </div>
            )}
         </div>

         {/* Pagination */}
         {sortedNotes.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-3 sm:flex-row">
               <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-muted-foreground">
                     {M.notes_page_per_page()}
                  </span>
                  <div className="flex gap-0.5 rounded-lg border border-border/40 bg-muted p-0.5">
                     {([10, 20, 50, 100] as const).map((size) => (
                        <Button
                           key={size}
                           variant="ghost"
                           size="xs"
                           type="button"
                           onClick={() => pagination.setPageSize(size)}
                           className={`cursor-pointer ${
                              pagination.pageSize === size
                                 ? 'bg-background text-primary shadow-xs'
                                 : ''
                           }`}
                        >
                           {size}
                        </Button>
                     ))}
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-muted-foreground">
                     {M.notes_page_showing({
                        from: String(
                           sortedNotes.length === 0
                              ? 0
                              : pagination.startIndex + 1,
                        ),
                        to: String(
                           Math.min(pagination.endIndex, sortedNotes.length),
                        ),
                        total: String(sortedNotes.length),
                     })}
                  </span>
                  <div className="flex items-center gap-1">
                     <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={pagination.isFirstPage}
                        onClick={pagination.firstPage}
                     >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                     </Button>
                     <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={pagination.isFirstPage}
                        onClick={pagination.prevPage}
                     >
                        <ChevronLeft className="h-3.5 w-3.5" />
                     </Button>
                     <span className="min-w-[70px] text-center text-[11px] font-semibold text-foreground/70">
                        {M.notes_page_page_of({
                           current: String(pagination.currentPage),
                           total: String(pagination.totalPages),
                        })}
                     </span>
                     <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={pagination.isLastPage}
                        onClick={pagination.nextPage}
                     >
                        <ChevronRight className="h-3.5 w-3.5" />
                     </Button>
                     <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={pagination.isLastPage}
                        onClick={pagination.lastPage}
                     >
                        <ChevronsRight className="h-3.5 w-3.5" />
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* CREATE DIALOG */}
         <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl sm:max-w-[90%] md:max-w-[800px]">
               <form
                  onSubmit={handleCreateSubmit}
                  className="flex max-h-[85vh] flex-col overflow-hidden"
               >
                  <DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4">
                     <DialogTitle className="text-lg font-semibold tracking-tight">
                        {M.notes_page_create_dialog_title()}
                     </DialogTitle>
                     <DialogDescription className="text-xs text-muted-foreground">
                        {M.notes_page_create_dialog_desc()}
                     </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 space-y-4 overflow-y-auto p-6">
                     <NoteEditor
                        title={noteTitle}
                        content={noteContent}
                        tags={noteTags}
                        allTags={allTags}
                        tab={createTab}
                        isSplit={isSplitCreate}
                        onTitleChange={setNoteTitle}
                        onContentChange={setNoteContent}
                        onTagsChange={setNoteTags}
                        onTabChange={setCreateTab}
                        onSplitToggle={() => setIsSplitCreate((s) => !s)}
                        titlePlaceholder={M.notes_page_create_title_placeholder()}
                        contentPlaceholder={M.notes_page_create_content_placeholder()}
                        titleId="create-note-title"
                        textareaId="create-note-content"
                     />
                  </div>

                  <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/60 bg-background/95 px-6 py-4 sm:flex-row sm:justify-end">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className="rounded-lg"
                     >
                        {M.notes_page_create_cancel()}
                     </Button>
                     <Button type="submit" className="rounded-lg">
                        {M.notes_page_create_save()}
                     </Button>
                  </div>
               </form>
            </DialogContent>
         </Dialog>

         {/* EDIT DIALOG */}
         <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl sm:max-w-[90%] md:max-w-[800px]">
               <form
                  onSubmit={handleEditSubmit}
                  className="flex max-h-[85vh] flex-col overflow-hidden"
               >
                  <DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4">
                     <DialogTitle className="text-lg font-semibold tracking-tight">
                        {M.notes_page_edit_dialog_title()}
                     </DialogTitle>
                     <DialogDescription className="text-xs text-muted-foreground">
                        {M.notes_page_edit_dialog_desc()}
                     </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 space-y-4 overflow-y-auto p-6">
                     <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           {(
                              [
                                 ['write', M.notes_page_edit_write(), Edit3],
                                 ['preview', M.notes_page_edit_preview(), Eye],
                              ] as const
                           ).map(([key, label, Icon]) => (
                              <Button
                                 key={key}
                                 variant="ghost"
                                 size="sm"
                                 type="button"
                                 onClick={() => {
                                    setEditTab(key);
                                    if (isSplitEdit) setIsSplitEdit(false);
                                 }}
                                 className={`cursor-pointer ${
                                    editTab === key && !isSplitEdit
                                       ? 'border-b-2 border-primary text-primary'
                                       : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                                 }`}
                              >
                                 <Icon className="h-3.5 w-3.5" />
                                 {label}
                              </Button>
                           ))}
                        </div>
                        <div className="flex items-center gap-2">
                           <div
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                 saveStatus === 'saved'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : saveStatus === 'saving'
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                      : 'bg-muted text-muted-foreground'
                              }`}
                           >
                              <span
                                 className={`h-1.5 w-1.5 rounded-full ${
                                    saveStatus === 'saved'
                                       ? 'bg-emerald-500'
                                       : saveStatus === 'saving'
                                         ? 'bg-amber-500 animate-pulse'
                                         : 'bg-muted-foreground/40'
                                 }`}
                              />
                              {saveStatus === 'saved'
                                 ? M.notes_page_edit_saved()
                                 : saveStatus === 'saving'
                                   ? M.notes_page_edit_saving()
                                   : M.notes_page_edit_unsaved()}
                           </div>
                           <Button
                              variant="outline"
                              size="xs"
                              type="button"
                              onClick={() => setIsSplitEdit((s) => !s)}
                              className={`cursor-pointer ${
                                 isSplitEdit
                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                    : ''
                              }`}
                           >
                              {M.notes_page_edit_split_view()}
                           </Button>
                        </div>
                     </div>

                     <NoteEditor
                        title={noteTitle}
                        content={noteContent}
                        tags={noteTags}
                        allTags={allTags}
                        tab={editTab}
                        isSplit={isSplitEdit}
                        onTitleChange={setNoteTitle}
                        onContentChange={setNoteContent}
                        onTagsChange={setNoteTags}
                        onTabChange={(t) => setEditTab(t)}
                        onSplitToggle={() => setIsSplitEdit((s) => !s)}
                        titlePlaceholder={M.notes_page_edit_title_placeholder()}
                        contentPlaceholder={M.notes_page_edit_content_placeholder()}
                        titleId="edit-note-title"
                        textareaId="edit-note-content"
                     />
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 bg-background/95 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                           activeNote && exportMarkdown(noteTitle, noteContent)
                        }
                        className="gap-1.5 self-start rounded-lg border-emerald-500/30 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 sm:self-auto"
                     >
                        <FileDown className="h-3.5 w-3.5" />
                        {M.notes_page_edit_export()}
                     </Button>
                     <div className="flex gap-3">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => setIsEditOpen(false)}
                           className="rounded-lg"
                        >
                           {M.notes_page_edit_cancel()}
                        </Button>
                        <Button type="submit" className="rounded-lg">
                           {M.notes_page_edit_save()}
                        </Button>
                     </div>
                  </div>
               </form>
            </DialogContent>
         </Dialog>

         {/* DELETE CONFIRM */}
         <AlertDialog
            open={!!deleteTarget}
            onOpenChange={(open) => {
               if (!open) setDeleteTarget(null);
            }}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>
                     {M.notes_page_delete_title()}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                     {M.notes_page_delete_desc({
                        title: deleteTarget?.title ?? '',
                     })}
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
                     {M.notes_page_delete_cancel()}
                  </AlertDialogCancel>
                  <AlertDialogAction
                     variant="destructive"
                     onClick={handleDeleteConfirm}
                  >
                     {M.notes_page_delete_confirm()}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
