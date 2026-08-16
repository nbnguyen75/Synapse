import type { LexicalCommand } from 'lexical';

import { useCallback, useEffect, useState } from 'react';

import {
  $findMatchingParent,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';

import { m } from '@/paraglide/messages';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TOGGLE_LINK_DIALOG_COMMAND: LexicalCommand<void> = createCommand(
  'TOGGLE_LINK_DIALOG_COMMAND',
);

/**
 * Opens a URL dialog for the current selection (shortcut: `editor-link`,
 * default `mod+k`). Save dispatches `TOGGLE_LINK_COMMAND` (`null` removes the
 * link, so clearing the input unlinks). The dialog only opens when there is
 * selected text or the caret sits inside an existing link — `$toggleLink`
 * needs a target to wrap or edit.
 */
export default function LinkShortcutPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');

  const openLinkDialog = useCallback(() => {
    const canEditLink = editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return false;
      if (!selection.isCollapsed()) return true;
      return (
        $findMatchingParent(selection.anchor.getNode(), $isLinkNode) !== null
      );
    });
    if (!canEditLink) return;

    const currentUrl = editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return '';
      const linkNode = $findMatchingParent(
        selection.anchor.getNode(),
        $isLinkNode,
      );
      return linkNode?.getURL() ?? '';
    });

    setUrl(currentUrl);
    setIsOpen(true);
  }, [editor]);

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

  const handleSave = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null);
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
            handleSave();
          }}
        >
          <Input
            autoFocus
            placeholder={m.lexical_link_dialog_placeholder()}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsOpen(false);
              }
            }}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              {m.lexical_link_dialog_cancel()}
            </Button>
            <Button type="submit">{m.lexical_link_dialog_save()}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
