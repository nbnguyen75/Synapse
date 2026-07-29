import { useForm } from 'react-hook-form';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';

import { useCreateNoteMutation } from '@/features/notes/hooks/use-note-mutation';
import { noteFormSchema, type NoteFormValues } from '@/features/notes/schemas';
import { NoteForm } from '@/features/notes/components';

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

interface QuickCreateNoteDialogProps {
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
}

export default function QuickCreateNoteDialog({
  onOpenChange,
  isOpen,
}: QuickCreateNoteDialogProps) {
  const { mutate: createNote, isPending } = useCreateNoteMutation();

  const form = useForm<NoteFormValues>({
    resolver: standardSchemaResolver(noteFormSchema),
    defaultValues: { content: undefined, title: '' },
    mode: 'onBlur',
  });

  const onSubmit = (data: NoteFormValues) => {
    createNote({ data });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] md:max-w-[75%]">
        <DialogHeader>
          <DialogTitle>{m.notes_page_create_dialog_title()}</DialogTitle>

          <DialogDescription>
            {m.notes_page_create_dialog_desc()}
          </DialogDescription>
        </DialogHeader>

        <NoteForm
          id="create-note-form"
          form={form}
          onSubmit={onSubmit}
          isPending={isPending}
        />

        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting || isPending}
          >
            {m.notes_page_create_cancel()}
          </Button>

          <Button
            type="submit"
            form="create-note-form"
            className="cursor-pointer"
            disabled={
              form.formState.isSubmitting ||
              isPending ||
              !form.formState.isDirty
            }
          >
            {form.formState.isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              m.notes_page_create_save()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
