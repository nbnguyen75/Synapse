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

import { NoteEditor } from './note-editor';

import { m } from '@/paraglide/messages';

interface CreateNoteDialogProps {
   onOpenChange: (open: boolean) => void;
   onContentChange: (v: string) => void;
   onTitleChange: (v: string) => void;
   onTagsChange: (v: string) => void;
   onTabChange: (t: NoteTab) => void;
   onSubmit: (e: FormEvent) => void;
   onSplitToggle: () => void;
   isSplitCreate: boolean;
   noteContent: string;
   createTab: NoteTab;
   noteTitle: string;
   allTags: string[];
   noteTags: string;
   isOpen: boolean;
}

export function CreateNoteDialog({
   onContentChange,
   isSplitCreate,
   onTitleChange,
   onSplitToggle,
   onOpenChange,
   onTagsChange,
   noteContent,
   onTabChange,
   noteTitle,
   createTab,
   noteTags,
   onSubmit,
   allTags,
   isOpen,
}: CreateNoteDialogProps) {
   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl sm:max-w-[90%] md:max-w-[800px]">
            <form
               onSubmit={onSubmit}
               className="flex max-h-[85vh] flex-col overflow-hidden"
            >
               <DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4">
                  <DialogTitle className="text-lg font-semibold tracking-tight">
                     {m.notes_page_create_dialog_title()}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                     {m.notes_page_create_dialog_desc()}
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
                     onTitleChange={onTitleChange}
                     onContentChange={onContentChange}
                     onTagsChange={onTagsChange}
                     onTabChange={onTabChange}
                     onSplitToggle={onSplitToggle}
                     titlePlaceholder={m.notes_page_create_title_placeholder()}
                     contentPlaceholder={m.notes_page_create_content_placeholder()}
                     titleId="create-note-title"
                     textareaId="create-note-content"
                  />
               </div>

               <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/60 bg-background/95 px-6 py-4 sm:flex-row sm:justify-end">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => onOpenChange(false)}
                     className="rounded-lg"
                  >
                     {m.notes_page_create_cancel()}
                  </Button>
                  <Button type="submit" className="rounded-lg">
                     {m.notes_page_create_save()}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
