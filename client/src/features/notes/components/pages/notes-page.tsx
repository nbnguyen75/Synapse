import { useCallback, Suspense, lazy } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { DeleteAlertDialog } from '@/features/notes/components/dialogs/delete-alert-dialog';
import { CreateNoteDialog } from '@/features/notes/components/dialogs/create-note-dialog';
import { TemplateSelector } from '@/features/notes/components/dialogs/template-selector';
import { NoteBatchActions } from '@/features/notes/components/list/note-batch-actions';
import { EditNoteDialog } from '@/features/notes/components/dialogs/edit-note-dialog';
import { NotesPagination } from '@/features/notes/components/list/notes-pagination';
import { FullPageView } from '@/features/notes/components/pages/full-page-view';
import { NotesHeader } from '@/features/notes/components/list/notes-header';
import { NoteEditor } from '@/features/notes/components/editor/note-editor';
import { exportMarkdown, getReadTime } from '@/features/notes/constants';
import { useMultiSelect } from '@/features/notes/hooks/use-multi-select';
import { NoteCard } from '@/features/notes/components/list/note-card';
import useNotes from '@/features/notes/hooks/use-notes';

import { m } from '@/paraglide/messages';

import MarkdownRenderer from '@/components/common/markdown-renderer';

import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
   FileText,
   Plus,
   ArrowLeft,
   Trash2,
   Download,
   Save,
   Sparkles,
} from 'lucide-react';

export default function NotesPage() {
   const {
      handleCreatePageAiTitle,
      handleCreatePageSubmit,
      viewingNoteForDetails,
      handleCloseDetailView,
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
   } = useNotes();

   const queryClient = useQueryClient();
   const multiSelect = useMultiSelect();

   const handleBatchUpdate = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
   }, [queryClient]);

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
                     <MarkdownRenderer content={noteContent} />
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
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm min-h-50">
                     <MarkdownRenderer content={noteContent} />
                  </div>
               )}
            </div>
         </FullPageView>
      );
   }

   return (
      <div className="flex h-full flex-col overflow-hidden">
         <NotesHeader
            sortBy={sortBy}
            onSortChange={(value) => updateSearchParam('sort', value)}
            onCreateClick={handleCreatePageOpen}
         />

         <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
               {isLoading ? (
                  <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <div
                           key={i}
                           className="rounded-xl border-none bg-background shadow-flat-sm p-4 h-64"
                        >
                           <Skeleton className="mb-5 h-5 w-3/4" />
                           <Skeleton className="h-20 w-full" />
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
                           isBatchMode={multiSelect.selectedCount > 0}
                           isSelected={multiSelect.selectedIds.has(note.id)}
                           onToggleSelect={multiSelect.toggleSelect}
                        />
                     ))}
                  </div>
               )}
            </div>

            <NotesPagination
               currentPage={pagination.currentPage}
               totalPages={pagination.totalPages}
               isFirstPage={pagination.isFirstPage}
               isLastPage={pagination.isLastPage}
               onFirstPage={pagination.firstPage}
               onPrevPage={pagination.prevPage}
               onNextPage={pagination.nextPage}
               onLastPage={pagination.lastPage}
            />
         </div>

         <Button
            onClick={handleCreatePageOpen}
            className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg md:hidden cursor-pointer"
            size="icon"
         >
            <Plus className="size-5" />
         </Button>

         {multiSelect.selectedCount > 0 && (
            <NoteBatchActions
               selectedIds={multiSelect.selectedIds}
               onClearSelection={multiSelect.clearSelection}
               onBatchUpdate={handleBatchUpdate}
               allTags={allTags}
               paginatedIds={paginatedNotes.map((n) => n.id)}
               onSelectAllPage={multiSelect.selectAll}
               allNotes={notes}
            />
         )}

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
   () => import('@/features/notes/components/editor/lexical-editor'),
);
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
            <div className="h-50 rounded-lg border bg-muted/30 animate-pulse" />
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
