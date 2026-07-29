import type { BaseSyntheticEvent, ComponentProps } from 'react';
import type { NoteFormValues } from '@/features/notes/schemas';

import { Controller, type UseFormReturn } from 'react-hook-form';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { LexicalEditor, MarkdownRenderer } from '@/components/shared';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface NoteFormProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSubmit?: (
    data: NoteFormValues,
    $event?: BaseSyntheticEvent,
  ) => Promise<void> | void;
  form: UseFormReturn<NoteFormValues>;
  isPending?: boolean;
}

export default function NoteForm({
  isPending = false,
  className,
  onSubmit,
  form,
  ...restProps
}: NoteFormProps) {
  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
  } = form;

  return (
    <form
      onSubmit={handleSubmit((data, $event) => onSubmit?.(data, $event))}
      className={cn('w-full space-y-4', className)}
      {...restProps}
    >
      <Controller
        name="title"
        control={control}
        render={({ fieldState, field }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-xs font-medium text-zinc-400"
              htmlFor="create-note-title"
            >
              {m.notes_page_create_title_label()}
            </FieldLabel>

            <Input
              {...field}
              id="create-note-title"
              type="text"
              placeholder={m.notes_page_create_title_placeholder()}
              aria-invalid={fieldState.invalid}
              className="w-full bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 h-9.5 rounded-lg text-xs"
              disabled={isSubmitting || isPending}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="content"
        control={control}
        render={({ fieldState, field }) => (
          <Tabs defaultValue="edit" className="w-full h-full">
            <TabsList variant="line">
              <TabsTrigger value="edit">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <Field data-invalid={fieldState.invalid}>
                <LexicalEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  id="create-note-content"
                  placeholder={m.notes_page_create_content_placeholder()}
                  className="min-h-40 max-h-80"
                  onBlur={field.onBlur}
                  disabled={isSubmitting || isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            </TabsContent>

            <TabsContent value="preview">
              <div className="p-4 border border-border rounded-md bg-background flex flex-col focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                <MarkdownRenderer
                  content={field.value || '_No content_'}
                  className="markdown-body"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      />
    </form>
  );
}
