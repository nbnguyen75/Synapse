import type { NoteTab } from '@/features/notes/types';
import type { Note } from '@/features/notes/types';

import { Suspense, lazy, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import { TemplateSelector } from '@/features/notes/components/dialogs/template-selector';
import { FullPageView } from '@/features/notes/components/pages/full-page-view';
import { generateAiTitle } from '@/features/notes/lib/ai-title';
import { getReadTime } from '@/features/notes/constants';
import { createNote } from '@/features/notes/api';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import MarkdownRenderer from '@/components/common/markdown-renderer';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ArrowLeft, Sparkles } from 'lucide-react';

export const Route = createFileRoute('/_app/notes/create')({
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_create_page_title()) }],
  }),
  component: CreateNotePage,
});

function CreateNotePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tab, setTab] = useState<NoteTab>('write');
  const [isSplit, setIsSplit] = useState(false);

  const allExistingNotes = queryClient.getQueryData<Note[]>(['notes']) || [];
  // const allTags = Array.from(
  //   new Set(allExistingNotes.flatMap((n) => n.tags || [])),
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
    onSuccess: (data) => {
      toast.success(m.notes_page_toast_created(), {
        description: m.notes_page_toast_created_desc({ title: data.title }),
      });
    },
    mutationFn: ({
      content,
      title,
    }: {
      content: string;
      tags: string[];
      title: string;
    }) => createNote({ content, title }),
    onError: (_err, _v, ctx) => {
      queryClient.setQueryData(['notes'], ctx?.prev);
      toast.error(m.notes_page_toast_create_failed());
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createMutation.mutate(
      { tags: tagsArr, content, title },
      { onSuccess: () => navigate({ to: '/notes' }) },
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
          <span className="text-sm font-medium">
            {m.notes_page_create_page_title()}
          </span>
          <div className="flex-1" />
          {content && (
            <span className="text-[10px] text-muted-foreground">
              {getReadTime(content)}
            </span>
          )}
          <Button size="sm" onClick={handleSubmit}>
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
            {m.notes_page_create_write()}
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
            {m.notes_page_create_preview()}
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
            <NoteEditorInline
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
            />
          </div>
        ) : tab === 'write' ? (
          <LexicalEditorInline
            value={content}
            onChange={setContent}
            id="create-page-content"
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

import { NoteEditor } from '@/features/notes/components/editor/note-editor';

function NoteEditorInline(props: React.ComponentProps<typeof NoteEditor>) {
  return <NoteEditor {...props} />;
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
