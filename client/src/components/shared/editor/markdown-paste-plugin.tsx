import { useEffect } from 'react';

import {
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
  $getRoot,
  $getSelection,
  type PasteCommandType,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromMarkdownString } from '@lexical/markdown';

import { CUSTOM_TRANSFORMERS } from './lexical-config';

export default function MarkdownPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<PasteCommandType>(
      PASTE_COMMAND,
      (event: PasteCommandType) => {
        if ('clipboardData' in event && event.clipboardData) {
          const plainText = event.clipboardData.getData('text/plain');
          const htmlText = event.clipboardData.getData('text/html');

          if (plainText && !htmlText) {
            event.preventDefault();
            editor.update(() => {
              const nodes = $generateNodesFromMarkdownString(plainText, CUSTOM_TRANSFORMERS);
              if (nodes.length === 0) return;

              const selection = $getSelection();
              if (selection && selection.getNodes().length > 0) {
                selection.insertNodes(nodes);
              } else {
                const root = $getRoot();
                root.append(...nodes);
              }
            });
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
