// ! Not used, reference only
import type { Note } from '@/features/notes/types';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';

import { useUpdateNoteMutation } from '@/features/notes/hooks/use-note-mutation';
// import { noteFormSchema, type NoteFormValues } from '@/features/notes/schemas';

import { m } from '@/paraglide/messages';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import NoteForm from '@/features/notes/components/deprecated/note-form';

interface QuickEditNoteDialogProps {
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  note?: Note;
}

export default function QuickEditNoteDialog({
  onOpenChange,
  isOpen,
  note,
}: QuickEditNoteDialogProps) {
  const { mutate: updateNote, isPending } = useUpdateNoteMutation();

  // const form = useForm<NoteFormValues>({
  //   defaultValues: { content: undefined, title: '' },
  //   resolver: standardSchemaResolver(noteFormSchema),
  //   mode: 'onBlur',
  // });

  // useEffect(() => {
  //   if (note) {
  //     form.reset({ content: note.content, title: note.title });
  //   }
  // }, [note, form]);

  // const onSubmit = (data: NoteFormValues) => {
  //   if (!note) return;

  //   updateNote({ id: note.id, data });
  //   onOpenChange(false);
  //   form.reset();
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] md:max-w-[75%]">
        <DialogHeader>
          <DialogTitle>{m.notes_page_edit_dialog_title()}</DialogTitle>

          <DialogDescription>
            {m.notes_page_edit_dialog_desc()}
          </DialogDescription>
        </DialogHeader>

        <NoteForm
          id="update-note-form"
          // form={form}
          // onSubmit={onSubmit}
          isPending={isPending}
        />

        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            // disabled={form.formState.isSubmitting || isPending}
          >
            {m.notes_page_edit_cancel()}
          </Button>

          <Button
            type="submit"
            form="update-note-form"
            className="cursor-pointer"
            // disabled={
            //   form.formState.isSubmitting ||
            //   isPending ||
            //   !form.formState.isDirty
            // }
          >
            {/* {form.formState.isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              m.notes_page_edit_save()
            )} */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    // <Dialog open={isOpen} onOpenChange={onOpenChange}>
    //   <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl sm:max-w-[90%] md:max-w-[800px]">
    //     <form
    //       onSubmit={handleSubmit}
    //       className="flex max-h-[85vh] flex-col overflow-hidden"
    //     >
    //       <DialogHeader className="shrink-0 border-b border-border/60 px-6 pb-4">
    //         <DialogTitle className="text-lg font-semibold tracking-tight">
    //           {m.notes_page_edit_dialog_title()}
    //         </DialogTitle>
    //         <DialogDescription className="text-xs text-muted-foreground">
    //           {m.notes_page_edit_dialog_desc()}
    //         </DialogDescription>
    //       </DialogHeader>

    //       <div className="flex-1 space-y-4 overflow-y-auto p-6">
    //         <div className="mb-2 flex items-center justify-between">
    //           <div className="flex items-center gap-2">
    //             {(
    //               [
    //                 ['write', m.notes_page_edit_write(), Edit3],
    //                 ['preview', m.notes_page_edit_preview(), Eye],
    //               ] as const
    //             ).map(([key, label, Icon]) => (
    //               <Button
    //                 key={key}
    //                 variant="ghost"
    //                 size="sm"
    //                 type="button"
    //                 onClick={() => {
    //                   setTab(key);
    //                   if (isSplit) setIsSplit(false);
    //                 }}
    //                 className={`cursor-pointer ${
    //                   tab === key && !isSplit
    //                     ? 'border-b-2 border-primary text-primary'
    //                     : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
    //                 }`}
    //               >
    //                 <Icon className="h-3.5 w-3.5" />
    //                 {label}
    //               </Button>
    //             ))}
    //           </div>
    //           <div className="flex items-center gap-2">
    //             <div
    //               className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
    //                 displayStatus === 'saved'
    //                   ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    //                   : displayStatus === 'saving'
    //                     ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    //                     : 'bg-muted text-muted-foreground'
    //               }`}
    //             >
    //               <span
    //                 className={`h-1.5 w-1.5 rounded-full ${
    //                   displayStatus === 'saved'
    //                     ? 'bg-emerald-500'
    //                     : displayStatus === 'saving'
    //                       ? 'bg-amber-500 animate-pulse'
    //                       : 'bg-muted-foreground/40'
    //                 }`}
    //               />
    //               {displayStatus === 'saved'
    //                 ? m.notes_page_edit_saved()
    //                 : displayStatus === 'saving'
    //                   ? m.notes_page_edit_saving()
    //                   : m.notes_page_edit_unsaved()}
    //             </div>
    //             <Button
    //               variant="outline"
    //               size="xs"
    //               type="button"
    //               onClick={() => setIsSplit((s) => !s)}
    //               className={`cursor-pointer ${
    //                 isSplit
    //                   ? 'border-primary/30 bg-primary/10 text-primary'
    //                   : ''
    //               }`}
    //             >
    //               {m.notes_page_edit_split_view()}
    //             </Button>
    //           </div>
    //         </div>

    //         <NoteEditor
    //           title={title}
    //           content={content}
    //           tags={tags}
    //           allTags={[]}
    //           tab={tab}
    //           isSplit={isSplit}
    //           onTitleChange={setTitle}
    //           onContentChange={setContent}
    //           onTagsChange={setTags}
    //           onTabChange={setTab}
    //           onSplitToggle={() => setIsSplit((s) => !s)}
    //           titlePlaceholder={m.notes_page_edit_title_placeholder()}
    //           contentPlaceholder={m.notes_page_edit_content_placeholder()}
    //           titleId="edit-note-title"
    //           textareaId="edit-note-content"
    //         />
    //       </div>

    //       <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 bg-background/95 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
    //         <Button
    //           type="button"
    //           variant="outline"
    //           onClick={() => exportMarkdown(title, content)}
    //           className="gap-1.5 self-start rounded-lg border-emerald-500/30 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 sm:self-auto"
    //         >
    //           <FileDown className="h-3.5 w-3.5" />
    //           {m.notes_page_edit_export()}
    //         </Button>
    //         <div className="flex gap-3">
    //           <Button
    //             type="button"
    //             variant="outline"
    //             onClick={() => onOpenChange(false)}
    //             className="rounded-lg"
    //           >
    //             {m.notes_page_edit_cancel()}
    //           </Button>
    //           <Button type="submit" className="rounded-lg">
    //             {m.notes_page_edit_save()}
    //           </Button>
    //         </div>
    //       </div>
    //     </form>
    //   </DialogContent>
    // </Dialog>
  );
}
