import { useEffect } from 'react';

import {
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
  type PasteCommandType,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';

import { CUSTOM_TRANSFORMERS } from './lexical-plugins';

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
              $convertFromMarkdownString(plainText, CUSTOM_TRANSFORMERS);
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
