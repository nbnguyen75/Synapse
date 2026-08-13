import { Controller } from 'react-hook-form';
import { useEffect } from 'react';

import { createFileRoute, redirect, useParams } from '@tanstack/react-router';

import { z } from 'zod/v4';

import {
  getMarkdownReadTimeSync,
  exportMarkdown,
} from '@/features/notes/service';
import { useGoToCompanion } from '@/features/companion/hooks/use-go-to-companion';
import { useNoteDetails } from '@/features/notes/hooks';

import { useCompanionContextStore } from '@/store/companion-context-store';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

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
  MessagesSquareIcon,
  MoreHorizontalIcon,
  SaveIcon,
  Trash2Icon,
} from 'lucide-react';

export const Route = createFileRoute('/_app/notes/$noteId')({
  loader: async ({ params }) => {
    const { noteId } = params;
    try {
      const result = await $fetch.api.v1.notes[':id'].$get({
        params: { id: noteId },
      });

      return result.data;
    } catch {
      console.error(`Note not found with id: ${noteId}`);

      throw redirect({ to: '/notes' });
    }
  },
  staticData: {
    breadcrumb: ({ loaderData, params }) =>
      (loaderData as { title?: string })?.title || params.noteId,
  },
  validateSearch: z.object({
    from: z.enum(['favorites', 'archive', 'trash']).optional(),
  }),
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_detail_title()) }],
  }),
  component: NoteDetailsPage,
});

function NoteDetailsPage() {
  const initialData = Route.useLoaderData();
  const { actions, status, state, form, note } = useNoteDetails(initialData);

  const { watchedContent, watchedTitle, activeTab } = state;
  const {
    formState: { isDirty },
    control,
  } = form;
  const { deleteNotePermanently, backToNotesPage, setActiveTab, saveChanges } =
    actions;
  const { isDeleting, isUpdating } = status;

  const { noteId } = useParams({ from: '/_app/notes/$noteId' });
  const setActiveDocument = useCompanionContextStore(
    (state) => state.setActiveDocument,
  );
  const goToCompanion = useGoToCompanion();

  useEffect(() => {
    setActiveDocument({
      content: watchedContent ?? '',
      title: watchedTitle ?? '',
      id: noteId,
    });

    return () => setActiveDocument(null);
  }, [noteId, watchedTitle, watchedContent, setActiveDocument]);

  return (
    <form onSubmit={saveChanges} className="h-full">
      <Tabs
        defaultValue="preview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex h-full flex-col"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-8 py-2.5 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={backToNotesPage}
                className="rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
              >
                <ArrowLeftIcon className="size-4" />
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isUpdating || isDeleting || !isDirty}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md"
              >
                <SaveIcon className="size-3.5" />
                {isUpdating
                  ? m.notes_page_edit_saving()
                  : m.notes_page_edit_save_short()}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex text-[11px] font-medium text-muted-foreground items-center gap-1 px-2 py-1 rounded-md">
                <ClockIcon className="size-3" />
                {getMarkdownReadTimeSync(watchedContent)}
              </span>

              <TabsList className="h-8 p-0.5" variant="line">
                <TabsTrigger
                  value="edit"
                  className="h-7 text-xs px-3 gap-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                  disabled={isUpdating || isDeleting}
                >
                  <Edit3Icon className="size-3.5" />
                  {m.notes_page_edit_tab_edit()}
                </TabsTrigger>

                <TabsTrigger
                  value="preview"
                  className="h-7 text-xs px-3 gap-1.5 rounded-md font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                  disabled={isUpdating || isDeleting}
                >
                  <EyeIcon className="size-3.5" />
                  {m.notes_page_edit_preview()}
                </TabsTrigger>
              </TabsList>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-lg"
                      disabled={isUpdating || isDeleting}
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  }
                />

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={goToCompanion}
                    className="cursor-pointer"
                  >
                    <MessagesSquareIcon className="size-4 mr-2 text-violet-500" />
                    <span>{m.notes_page_include_in_chat()}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      note &&
                      exportMarkdown({
                        ...note,
                        title: watchedTitle ?? '',
                        content: watchedContent,
                      })
                    }
                    className="cursor-pointer"
                  >
                    <DownloadIcon className="size-4 mr-2" />
                    <span>{m.notes_page_export_markdown()}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={deleteNotePermanently}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <Trash2Icon className="size-4 mr-2" />
                    <span>{m.notes_page_delete_title()}</span>
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
                      placeholder={m.notes_page_untitled_placeholder()}
                      className="w-full resize-none bg-transparent text-3xl md:text-4xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/30 text-foreground border-none focus:ring-0 shadow-none py-7 px-0"
                      disabled={isUpdating || isDeleting}
                    />
                  )}
                />

                {/* <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-3 text-xs text-muted-foreground/80">
                  <TagIcon className="size-3.5 text-muted-foreground/60 mr-1" />

                  <Input
                    type="text"
                    value=""
                    placeholder={m.notes_page_tags_placeholder()}
                    className="h-6 border-none shadow-none focus-visible:ring-0 p-0 text-xs bg-transparent max-w-70 placeholder:text-muted-foreground/40"
                    disabled={isUpdating || isDeleting}
                  />
                </div> */}

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
                        className="h-full max-h-120"
                        disabled={isUpdating || isDeleting}
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
