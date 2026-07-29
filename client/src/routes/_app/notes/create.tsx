import type { NoteFormValues } from '@/features/notes/schemas';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import { useCreateNoteMutation } from '@/features/notes/hooks/use-note-mutation';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { LexicalEditor, MarkdownRenderer } from '@/components/shared';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  ArrowLeftIcon,
  Edit3Icon,
  EyeIcon,
  SaveIcon,
  TagIcon,
} from 'lucide-react';

export const Route = createFileRoute('/_app/notes/create')({
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_create_page_title()) }],
  }),
  component: CreateNotePage,
});

function CreateNotePage() {
  const navigate = useNavigate();

  const createNoteMutation = useCreateNoteMutation();

  const form = useForm<NoteFormValues>({
    defaultValues: {
      content: undefined,
      title: '',
    },
  });

  const { handleSubmit, control } = form;

  const [watchedContent] = useWatch({
    name: ['content', 'title'],
    control,
  });

  const onSave = (data: NoteFormValues) => {
    createNoteMutation.mutate({
      data: {
        ...data,
      },
    });

    navigate({ replace: true, to: '/notes' });
  };

  // const handleAiTitle = () => {
  //   if (!watchedContent) return;
  //   const generated = generateAiTitle(watchedContent);
  //   setValue('title', generated, { shouldDirty: true });
  //   toast.success(m.notes_page_ai_title_success());
  // };

  return (
    <form onSubmit={handleSubmit(onSave)} className="h-full">
      <Tabs defaultValue="create" className="flex h-full flex-col">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-8 py-2.5 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate({ to: '/notes' })}
                className="rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
              >
                <ArrowLeftIcon className="size-4" />
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={createNoteMutation.isPending}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md"
              >
                <SaveIcon className="size-3.5" />
                {createNoteMutation.isPending
                  ? m.notes_page_create_saving()
                  : m.notes_page_create_create()}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <TabsList className="h-8 p-0.5" variant="line">
                <TabsTrigger
                  value="create"
                  className="h-7 text-xs px-3 gap-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <Edit3Icon className="size-3.5" />
                  {m.notes_page_create_tab_create()}
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="h-7 text-xs px-3 gap-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <EyeIcon className="size-3.5" />
                  {m.notes_page_create_preview()}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-5xl px-6 py-8 md:py-12 space-y-4">
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={m.notes_page_untitled_placeholder()}
                      className="w-full resize-none bg-transparent text-3xl md:text-4xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/30 text-foreground border-none focus:ring-0 shadow-none py-7 px-0"
                    />
                  )}
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-3 text-xs text-muted-foreground/80">
                  <TagIcon className="size-3.5 text-muted-foreground/60 mr-1" />
                  <Input
                    type="text"
                    value=""
                    placeholder={m.notes_page_tags_placeholder()}
                    className="h-6 border-none shadow-none focus-visible:ring-0 p-0 text-xs bg-transparent max-w-70 placeholder:text-muted-foreground/40"
                  />
                </div>

                <TabsContent
                  value="create"
                  className="m-0 focus-visible:outline-none min-h-125"
                >
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <LexicalEditor
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        id="details-note-content"
                        className="h-full max-h-120"
                        placeholder={m.notes_page_lexical_placeholder()}
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent
                  value="preview"
                  className="m-0 focus-visible:outline-none min-h-125"
                >
                  <div className="border border-border/80 rounded-xl bg-background flex flex-col focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200 px-5 py-5 h-full max-h-120 overflow-y-auto">
                    <MarkdownRenderer
                      className="h-full"
                      content={
                        watchedContent || m.notes_page_empty_preview_fallback()
                      }
                    />
                  </div>
                </TabsContent>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </form>
  );
}
