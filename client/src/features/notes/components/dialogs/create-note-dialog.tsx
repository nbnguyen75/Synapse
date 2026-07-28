import type { NoteTab } from '../../types';
import type { Note } from '../../types';

import { useMemo, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { createNote } from '@/features/notes/api';

import { m } from '@/paraglide/messages';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { NoteEditor } from '../editor/note-editor';

interface CreateNoteDialogProps {
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
}

export function CreateNoteDialog({
  onOpenChange,
  isOpen,
}: CreateNoteDialogProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tab, setTab] = useState<NoteTab>('write');
  const [isSplit, setIsSplit] = useState(false);

  const existingNotes = queryClient.getQueryData<Note[]>(['notes']);
  // const allTags = useMemo(
  //   () =>
  //     Array.from(new Set((existingNotes || []).flatMap((n) => n.tags || []))),
  //   [existingNotes],
  // );

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
        // tags: newData.tags,
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
    }) => createNote({ content, title }),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createMutation.mutate(
      { tags: tagsArr, content, title },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setTags('');
          setTab('write');
          setIsSplit(false);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl sm:max-w-[90%] md:max-w-[800px]">
        <form
          onSubmit={handleSubmit}
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
              title={title}
              content={content}
              tags={tags}
              allTags={[]}
              tab={tab}
              isSplit={isSplit}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onTagsChange={setTags}
              onTabChange={setTab}
              onSplitToggle={() => setIsSplit((s) => !s)}
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
