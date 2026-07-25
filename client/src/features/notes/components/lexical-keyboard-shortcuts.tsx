import { useEffect } from 'react';

import {
   $getSelection,
   $isRangeSelection,
   $createParagraphNode,
   FORMAT_TEXT_COMMAND,
   KEY_DOWN_COMMAND,
   COMMAND_PRIORITY_LOW,
   type LexicalEditor as LexicalEditorType,
} from 'lexical';
import {
   $createHeadingNode,
   $createQuoteNode,
   type HeadingTagType,
} from '@lexical/rich-text';
import {
   INSERT_UNORDERED_LIST_COMMAND,
   INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $setBlocksType } from '@lexical/selection';

export type { HeadingTagType };

export function formatHeadingBlock(
   editor: LexicalEditorType,
   tag: HeadingTagType,
) {
   editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         $setBlocksType(selection, () => $createHeadingNode(tag));
      }
   });
}

export function formatParagraphBlock(editor: LexicalEditorType) {
   editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         $setBlocksType(selection, () => $createParagraphNode());
      }
   });
}

export function formatQuoteBlock(editor: LexicalEditorType) {
   editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         $setBlocksType(selection, () => $createQuoteNode());
      }
   });
}

export default function KeyboardShortcutsPlugin() {
   const [editor] = useLexicalComposerContext();

   useEffect(() => {
      return editor.registerCommand(
         KEY_DOWN_COMMAND,
         (event: KeyboardEvent) => {
            const { shiftKey, ctrlKey, metaKey, altKey, code } = event;
            const isMod = ctrlKey || metaKey;

            if (isMod) {
               if (code === 'KeyB' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                  return true;
               }
               if (code === 'KeyI' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                  return true;
               }
               if (code === 'KeyU' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                  return true;
               }
               if (code === 'KeyX' && shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                  return true;
               }
               if (code === 'KeyE' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                  return true;
               }

               if (altKey && !shiftKey) {
                  if (code === 'Digit1' || code === 'Numpad1') {
                     event.preventDefault();
                     formatHeadingBlock(editor, 'h1');
                     return true;
                  }
                  if (code === 'Digit2' || code === 'Numpad2') {
                     event.preventDefault();
                     formatHeadingBlock(editor, 'h2');
                     return true;
                  }
                  if (code === 'Digit3' || code === 'Numpad3') {
                     event.preventDefault();
                     formatHeadingBlock(editor, 'h3');
                     return true;
                  }
                  if (code === 'Digit0' || code === 'Numpad0') {
                     event.preventDefault();
                     formatParagraphBlock(editor);
                     return true;
                  }
               }

               if (shiftKey && !altKey) {
                  if (code === 'Digit8' || code === 'KeyU') {
                     event.preventDefault();
                     editor.dispatchCommand(
                        INSERT_UNORDERED_LIST_COMMAND,
                        undefined,
                     );
                     return true;
                  }
                  if (code === 'Digit7' || code === 'KeyO') {
                     event.preventDefault();
                     editor.dispatchCommand(
                        INSERT_ORDERED_LIST_COMMAND,
                        undefined,
                     );
                     return true;
                  }
                  if (code === 'KeyQ') {
                     event.preventDefault();
                     formatQuoteBlock(editor);
                     return true;
                  }
               }
            }
            return false;
         },
         COMMAND_PRIORITY_LOW,
      );
   }, [editor]);

   return null;
}
