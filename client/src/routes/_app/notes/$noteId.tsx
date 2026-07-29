import type { NoteFormValues } from '@/features/notes/schemas';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import {
  useDeleteNoteMutation,
  useUpdateNoteMutation,
} from '@/features/notes/hooks/use-note-mutation';
import {
  getMarkdownReadTimeSync,
  exportMarkdown,
} from '@/features/notes/services';
import { getNote } from '@/features/notes/api';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { LexicalEditor, MarkdownRenderer } from '@/components/shared';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  ArrowLeftIcon,
  ClockIcon,
  DownloadIcon,
  Edit3Icon,
  EyeIcon,
  MoreHorizontalIcon,
  SaveIcon,
  SparklesIcon,
  TagIcon,
  Trash2Icon,
} from 'lucide-react';

export const Route = createFileRoute('/_app/notes/$noteId')({
  loader: async ({ params }) => {
    const { noteId } = params;
    try {
      const note = await getNote(noteId);
      return note;
    } catch (error) {
      console.error(`Note not found with id: ${noteId}`);
      throw redirect({ to: '/notes' });
    }
  },
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_detail_title()) }],
  }),
  component: NoteDetailsPage,
});

function NoteDetailsPage() {
  const note = Route.useLoaderData();
  const navigate = useNavigate();

  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();

  const form = useForm<NoteFormValues>({
    defaultValues: {
      content: note.content ?? '',
      title: note.title,
    },
  });

  const { handleSubmit, control } = form;

  const [watchedContent, watchedTitle] = useWatch({
    name: ['content', 'title'],
    control,
  });

  const onSave = (data: NoteFormValues) => {
    updateNoteMutation.mutate({
      data: {
        ...data,
      },
      id: note.id,
    });
  };

  const handleDelete = () => {
    if (!note) return;

    deleteNoteMutation.mutate(
      { id: note.id },
      {
        onSuccess: () => navigate({ to: '/notes' }),
      },
    );
  };

  // const handleAiTitle = () => {
  //   if (!watchedContent) return;
  //   const generated = generateAiTitle(watchedContent);
  //   setValue('title', generated, { shouldDirty: true });
  //   toast.success(m.notes_page_ai_title_success());
  // };

  return (
    <form onSubmit={handleSubmit(onSave)} className="h-full">
      <Tabs defaultValue="preview" className="flex h-full flex-col">
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
                disabled={updateNoteMutation.isPending}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md"
              >
                <SaveIcon className="size-3.5" />
                {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex text-[11px] font-medium text-muted-foreground items-center gap-1 px-2 py-1 rounded-md">
                <ClockIcon className="size-3" />
                {getMarkdownReadTimeSync(watchedContent || '')}
              </span>

              <TabsList className="h-8 p-0.5" variant="line">
                <TabsTrigger
                  value="edit"
                  className="h-7 text-xs px-3 gap-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <Edit3Icon className="size-3.5" />
                  Edit
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="h-7 text-xs px-3 gap-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                >
                  <EyeIcon className="size-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg"
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  }
                />

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="cursor-pointer">
                    <SparklesIcon className="size-4 mr-2 text-violet-500" />
                    <span>AI Generate Title</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      note &&
                      exportMarkdown({
                        ...note,
                        content: watchedContent,
                        title: watchedTitle,
                      })
                    }
                    className="cursor-pointer"
                  >
                    <DownloadIcon className="size-4 mr-2" />
                    <span>Export Markdown</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <Trash2Icon className="size-4 mr-2" />
                    <span>Delete Note</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      placeholder="Untitled Note..."
                      className="w-full resize-none bg-transparent text-3xl md:text-4xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/30 text-foreground border-none focus:ring-0 shadow-none py-7 px-0"
                    />
                  )}
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-3 text-xs text-muted-foreground/80">
                  <TagIcon className="size-3.5 text-muted-foreground/60 mr-1" />
                  <Input
                    type="text"
                    value={[]}
                    placeholder="Add tags separated by comma..."
                    className="h-6 border-none shadow-none focus-visible:ring-0 p-0 text-xs bg-transparent max-w-70 placeholder:text-muted-foreground/40"
                  />
                </div>

                <TabsContent
                  value="edit"
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
                        placeholder="Type '/' for commands or start writing..."
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
                      content={watchedContent || '_No content_'}
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
