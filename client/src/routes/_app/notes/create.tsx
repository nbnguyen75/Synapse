import { Controller } from 'react-hook-form';

import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod/v4';

import { useNoteCreate } from '@/features/notes/hooks';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { LexicalEditor, MarkdownRenderer } from '@/components/shared';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field, FieldError } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  ArrowLeftIcon,
  Edit3Icon,
  EyeIcon,
  Loader2Icon,
  SaveIcon,
  SparklesIcon,
  TagIcon,
} from 'lucide-react';

export const Route = createFileRoute('/_app/notes/create')({
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_create_page_title()) }],
  }),
  validateSearch: z.object({
    title: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  // TODO: create content rather than title since title will be empty
  const { title } = Route.useSearch();
  const { actions, status, state, form } = useNoteCreate({
    initialTitle: title,
  });

  const { watchedContent } = state;
  const { control } = form;
  const { isGeneratingTitle, isCreating } = status;
  const { generateNoteTitle, backToNotesPage, createNew } = actions;

  return (
    <form onSubmit={createNew} className="h-full">
      <Tabs defaultValue="create" className="flex h-full flex-col">
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
                disabled={isCreating}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md"
              >
                <SaveIcon className="size-3.5" />
                {isCreating
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
                    <InputGroup className="h-14 pl-3 resize-none bg-transparent font-semibold tracking-tight outline-none placeholder:text-muted-foreground/30 text-foreground border-none focus:ring-0 shadow-none py-7">
                      <InputGroupInput
                        {...field}
                        disabled={isCreating}
                        placeholder={m.notes_page_untitled_placeholder()}
                        className="text-3xl md:text-4xl"
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="default"
                          disabled={
                            !watchedContent?.trim() ||
                            isGeneratingTitle ||
                            isCreating
                          }
                          onClick={generateNoteTitle}
                          title={m.notes_page_ai_title()}
                          className="h-10 rounded-md"
                        >
                          {isGeneratingTitle ? (
                            <>
                              <Loader2Icon className="size-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="size-4" />
                              Generate title
                            </>
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-3 text-xs text-muted-foreground/80">
                  <TagIcon className="size-3.5 text-muted-foreground/60 mr-1" />
                  <Input
                    type="text"
                    value=""
                    disabled={isCreating}
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
                    render={({ fieldState, field }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <LexicalEditor
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          id="details-note-content"
                          className="h-full max-h-120"
                          placeholder={m.notes_page_lexical_placeholder()}
                          disabled={isCreating}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
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
