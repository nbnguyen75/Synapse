import type { NoteTab } from '@/features/notes/types';
import type { Note } from '@/features/notes/types';

import { Suspense, lazy, useEffect, useMemo, useState } from 'react';

import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { TemplateSelector } from '@/features/notes/components/dialogs/template-selector';
import { FullPageView } from '@/features/notes/components/pages/full-page-view';
import { NoteEditor } from '@/features/notes/components/editor/note-editor';
import { getReadTime, exportMarkdown } from '@/features/notes/constants';
import { useGetNoteQuery } from '@/features/notes/hooks/use-note-query';
import { generateAiTitle } from '@/features/notes/lib/ai-title';
import { updateNote } from '@/features/notes/api';

import { m } from '@/paraglide/messages';

import MarkdownRenderer from '@/components/common/markdown-renderer';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowLeft, Download, Save, Sparkles, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/_app/notes/$noteId')({
  head: () => ({
    meta: [{ title: 'Note Details' }],
  }),
  component: NoteDetailsPage,
});

function NoteDetailsPage() {
  const { noteId } = useParams({ from: '/_app/notes/$noteId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: note } = useGetNoteQuery(noteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tab, setTab] = useState<NoteTab>('write');
  const [isSplit, setIsSplit] = useState(false);
  const [saveState, setSaveState] = useState<'saving' | null>(null);

  useEffect(() => {
    if (note) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(note.title);
      setContent(note.content ?? '');
      // setTags(note.tags ? note.tags.join(', ') : '');
    }
  }, [note]);

  const allExistingNotes = queryClient.getQueryData<Note[]>(['notes']) || [];
  // const allTags = useMemo(
  //   () => Array.from(new Set(allExistingNotes.flatMap((n) => n.tags || []))),
  //   [allExistingNotes],
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
      await queryClient.cancelQueries({ queryKey: ['notes', noteId] });
      const prev = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData<Note[]>(['notes'], (old) =>
        (old || []).map((n) =>
          n.id === vars.id
            ? {
                ...n,
                updatedAt: new Date().toISOString(),
                content: vars.content ?? n.content,
                title: vars.title ?? n.title,
                // tags: vars.tags ?? n.tags,
              }
            : n,
        ),
      );
      queryClient.setQueryData<Note>(['notes', noteId], (old) =>
        old
          ? {
              ...old,
              content: vars.content ?? old.content,
              updatedAt: new Date().toISOString(),
              title: vars.title ?? old.title,
              // tags: vars.tags ?? old.tags,
            }
          : old,
      );
      return { prev };
    },
    mutationFn: (vars: {
      content?: string;
      tags?: string[];
      title?: string;
      id: string;
    }) => updateNote(vars.id, { content, title }),
    onError: (_err, _v, ctx) => {
      queryClient.setQueryData(['notes'], ctx?.prev);
      setSaveState(null);
    },
    onSuccess: (data) => {
      setSaveState(null);
      queryClient.setQueryData(['notes', noteId], data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const deleteMutation = useMutation({
    onSuccess: () => {
      toast.success(m.notes_page_toast_deleted(), {
        description: m.notes_page_toast_deleted_desc(),
      });
      navigate({ to: '/notes' });
    },
    mutationFn: (id: string) =>
      import('@/features/notes/api').then((m) => m.deleteNote(id)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleSaveNow = () => {
    if (!note || !title.trim()) return;
    setSaveState('saving');
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateMutation.mutate(
      { tags: tagsArr, id: note.id, content, title },
      { onSuccess: () => setSaveState(null) },
    );
  };

  const handleAiTitle = () => {
    if (!content) return;
    const generated = generateAiTitle(content);
    setTitle(generated);
    toast.success(m.notes_page_ai_title_success());
  };

  const handleApplyTemplate = (
    templateTitle: string,
    templateContent: string,
  ) => {
    setTitle(templateTitle.replace('{date}', new Date().toLocaleDateString()));
    setContent(templateContent);
  };

  useEffect(() => {
    if (!note || !isUnsaved) return;
    const timer = setTimeout(() => {
      if (!title.trim()) return;
      setSaveState('saving');
      const tagsArr = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      updateMutation.mutate(
        { tags: tagsArr, id: note.id, content, title },
        { onSuccess: () => setSaveState(null) },
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [isUnsaved, note, title, tags, content]);

  return (
    <FullPageView
      topBar={
        <div className="flex items-center gap-3 border-b px-6 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate({ to: '/notes' })}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {m.notes_page_detail_title()}
          </span>
          <div className="flex-1" />
          {content && (
            <span className="text-[10px] text-muted-foreground">
              {getReadTime(content)}
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
            onClick={() => exportMarkdown(title, content || '')}
          >
            <Download className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              if (note) deleteMutation.mutate(note.id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
          <Button size="sm" onClick={handleSaveNow}>
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
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={m.notes_page_create_tags_placeholder()}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {/* {allTags.map((tag) => {
                const has = tags
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
                      const current = tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      const next = has
                        ? current.filter((t) => t !== tag)
                        : [...current, tag];
                      setTags(next.join(', '));
                    }}
                  >
                    {tag}
                  </Badge>
                );
              })} */}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={m.notes_page_create_title_placeholder()}
            className="flex-1 bg-transparent text-xl font-semibold outline-none"
          />
          {content && (
            <Button variant="ghost" size="xs" onClick={handleAiTitle}>
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
              setTab('write');
              if (isSplit) setIsSplit(false);
            }}
            className={
              tab === 'write' && !isSplit
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
              setTab('preview');
              if (isSplit) setIsSplit(false);
            }}
            className={
              tab === 'preview' && !isSplit
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
            onClick={() => setIsSplit(!isSplit)}
          >
            {m.notes_page_create_split_view()}
          </Button>
        </div>
        {isSplit ? (
          <div className="grid grid-cols-2 gap-4">
            <NoteEditor
              title={title}
              content={content}
              tags={tags}
              allTags={[]}
              tab="write"
              isSplit={false}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onTagsChange={setTags}
              onTabChange={() => {}}
              onSplitToggle={() => {}}
              titleId="edit-page-title"
              textareaId="details-note-content-split"
              titlePlaceholder={m.notes_page_edit_title_placeholder()}
              contentPlaceholder={m.notes_page_edit_content_placeholder()}
            />
          </div>
        ) : tab === 'write' ? (
          <LexicalEditorInline
            value={content}
            onChange={setContent}
            id="details-note-content"
          />
        ) : (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm min-h-50">
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>
    </FullPageView>
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
