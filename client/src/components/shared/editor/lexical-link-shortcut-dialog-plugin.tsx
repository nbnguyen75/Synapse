import type { LexicalCommand } from 'lexical';

import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  $findMatchingParent,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod/v4';

import { m } from '@/paraglide/messages';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TOGGLE_LINK_DIALOG_COMMAND: LexicalCommand<void> = createCommand(
  'TOGGLE_LINK_DIALOG_COMMAND',
);

const URL_REGEX =
  /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

const linkFormSchema = z.object({
  url: z
    .string()
    .trim()
    .refine((val) => val === '' || URL_REGEX.test(val), {
      message: m.lexical_link_dialog_url_invalid(),
    }),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

export default function LinkShortcutPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);

  // Khởi tạo React Hook Form với Zod Resolver
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      url: '',
    },
  });

  const { isDirty } = form.formState;

  const openLinkDialog = useCallback(() => {
    const canEditLink = editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;
      if (!selection.isCollapsed()) return true;
      return $findMatchingParent(selection.anchor.getNode(), $isLinkNode) !== null;
    });
    if (!canEditLink) return;

    const currentUrl = editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return '';
      const linkNode = $findMatchingParent(selection.anchor.getNode(), $isLinkNode);
      return linkNode?.getURL() ?? '';
    });

    // Reset form với giá trị hiện tại và đặt isDirty = false
    form.reset({ url: currentUrl });
    setIsOpen(true);
  }, [editor, form]);

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_LINK_DIALOG_COMMAND,
      () => {
        openLinkDialog();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, openLinkDialog]);

  const onSubmit = (values: LinkFormValues) => {
    let targetUrl = values.url.trim();

    // Tự động thêm https:// nếu người dùng nhập domain không có protocol (ví dụ: google.com)
    if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, targetUrl || null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-background border border-border shadow-flat-lg rounded-2xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
            {m.lexical_link_dialog_title()}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          <Controller
            control={form.control}
            name="url"
            render={({ fieldState, field }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  autoFocus
                  placeholder={m.lexical_link_dialog_placeholder()}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setIsOpen(false);
                    }
                  }}
                />

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              {m.lexical_link_dialog_cancel()}
            </Button>

            <Button type="submit" disabled={!isDirty}>
              {m.lexical_link_dialog_save()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
