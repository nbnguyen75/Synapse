import type { NoteTab } from '../../types';
import type { Note } from '../../types';

import { useEffect, useMemo, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { exportMarkdown } from '@/features/notes/constants';
import { updateNote } from '@/features/notes/api';

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

import { Edit3, Eye, FileDown } from 'lucide-react';

interface EditNoteDialogProps {
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  isOpen: boolean;
}

export function EditNoteDialog({
  onOpenChange,
  isOpen,
  note,
}: EditNoteDialogProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tab, setTab] = useState<NoteTab>('write');
  const [isSplit, setIsSplit] = useState(false);
  const [saveState, setSaveState] = useState<'saving' | null>(null);

  useEffect(() => {
    if (note && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(note.title);
      setContent(note.content ?? '');
      // setTags(note.tags ? note.tags.join(', ') : '');
      setTab('write');
      setIsSplit(false);
      setSaveState(null);
    }
  }, [note, isOpen]);

  const existingNotes = queryClient.getQueryData<Note[]>(['notes']);
  // const allTags = useMemo(
  //   () =>
  //     Array.from(new Set((existingNotes || []).flatMap((n) => n.tags || []))),
  //   [existingNotes],
  // );

  const isUnsaved = useMemo(() => {
    if (!note) return false;
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return (
      title !== note.title || content !== note.content
      // JSON.stringify(tagsArr) !== JSON.stringify(note.tags || [])
    );
  }, [note, title, content, tags]);

  const displayStatus: 'saved' | 'saving' | 'unsaved' = isUnsaved
    ? 'unsaved'
    : (saveState ?? 'saved');

  const updateMutation = useMutation({
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const prev = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData<Note[]>(['notes'], (old) =>
        (old || []).map((n) =>
          n.id === vars.id
            ? {
                ...n,
                archived: vars.archived ?? n.archived,
                updatedAt: new Date().toISOString(),
                content: vars.content ?? n.content,
                pinned: vars.pinned ?? n.pinned,
                title: vars.title ?? n.title,
                // tags: vars.tags ?? n.tags,
              }
            : n,
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
    }) => updateNote(vars.id, { content, title }),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !title.trim()) return;
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateMutation.mutate(
      { tags: tagsArr, id: note.id, content, title },
      { onSuccess: () => onOpenChange(false) },
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
                      setTab(key);
                      if (isSplit) setIsSplit(false);
                    }}
                    className={`cursor-pointer ${
                      tab === key && !isSplit
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
                    displayStatus === 'saved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : displayStatus === 'saving'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
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
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  type="button"
                  onClick={() => setIsSplit((s) => !s)}
                  className={`cursor-pointer ${
                    isSplit
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : ''
                  }`}
                >
                  {m.notes_page_edit_split_view()}
                </Button>
              </div>
            </div>

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
              onClick={() => exportMarkdown(title, content)}
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
