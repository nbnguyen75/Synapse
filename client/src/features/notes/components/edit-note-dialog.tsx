import type { NoteTab } from '../types';

import { type FormEvent } from 'react';

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

import { exportMarkdown } from '../constants';

import { NoteEditor } from './note-editor';

import { Edit3, Eye, FileDown } from 'lucide-react';

import { m } from '@/paraglide/messages';

interface EditNoteDialogProps {
   saveStatus: 'saved' | 'saving' | 'unsaved';
   onOpenChange: (open: boolean) => void;
   onContentChange: (v: string) => void;
   onTitleChange: (v: string) => void;
   onTagsChange: (v: string) => void;
   onTabChange: (t: NoteTab) => void;
   onSubmit: (e: FormEvent) => void;
   onSplitToggle: () => void;
   isSplitEdit: boolean;
   noteContent: string;
   noteTitle: string;
   allTags: string[];
   noteTags: string;
   editTab: NoteTab;
   isOpen: boolean;
}

export function EditNoteDialog({
   onContentChange,
   onTitleChange,
   onSplitToggle,
   onOpenChange,
   onTagsChange,
   noteContent,
   isSplitEdit,
   onTabChange,
   saveStatus,
   noteTitle,
   noteTags,
   onSubmit,
   editTab,
   allTags,
   isOpen,
}: EditNoteDialogProps) {
   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl sm:max-w-[90%] md:max-w-[800px]">
            <form
               onSubmit={onSubmit}
               className="flex max-h-[85vh] flex-col overflow-hidden"
            >
               <DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4">
                  <DialogTitle className="text-lg font-semibold tracking-tight">
                     {m.notes_page_edit_dialog_title()}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                     {m.notes_page_edit_dialog_desc()}
                  </DialogDescription>
               </DialogHeader>

               <div className="flex-1 space-y-4 overflow-y-auto p-6">
                  <div className="mb-2 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {(
                           [
                              ['write', m.notes_page_edit_write(), Edit3],
                              ['preview', m.notes_page_edit_preview(), Eye],
                           ] as const
                        ).map(([key, label, Icon]) => (
                           <Button
                              key={key}
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => {
                                 onTabChange(key);
                                 if (isSplitEdit) onSplitToggle();
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
                              ? m.notes_page_edit_saved()
                              : saveStatus === 'saving'
                                ? m.notes_page_edit_saving()
                                : m.notes_page_edit_unsaved()}
                        </div>
                        <Button
                           variant="outline"
                           size="xs"
                           type="button"
                           onClick={onSplitToggle}
                           className={`cursor-pointer ${
                              isSplitEdit
                                 ? 'border-primary/30 bg-primary/10 text-primary'
                                 : ''
                           }`}
                        >
                           {m.notes_page_edit_split_view()}
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
                     onTitleChange={onTitleChange}
                     onContentChange={onContentChange}
                     onTagsChange={onTagsChange}
                     onTabChange={onTabChange}
                     onSplitToggle={onSplitToggle}
                     titlePlaceholder={m.notes_page_edit_title_placeholder()}
                     contentPlaceholder={m.notes_page_edit_content_placeholder()}
                     titleId="edit-note-title"
                     textareaId="edit-note-content"
                  />
               </div>

               <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 bg-background/95 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => exportMarkdown(noteTitle, noteContent)}
                     className="gap-1.5 self-start rounded-lg border-emerald-500/30 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 sm:self-auto"
                  >
                     <FileDown className="h-3.5 w-3.5" />
                     {m.notes_page_edit_export()}
                  </Button>
                  <div className="flex gap-3">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg"
                     >
                        {m.notes_page_edit_cancel()}
                     </Button>
                     <Button type="submit" className="rounded-lg">
                        {m.notes_page_edit_save()}
                     </Button>
                  </div>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
