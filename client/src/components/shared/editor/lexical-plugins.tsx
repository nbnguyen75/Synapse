import { useEffect, useRef } from 'react';

import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot } from 'lexical';

import { CUSTOM_TRANSFORMERS } from './lexical-config';

const normalizeMarkdown = (str: string) => str.replace(/\s+/g, ' ').trim();

export function InitialStatePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      editor.update(() => {
        $getRoot().clear();
        $convertFromMarkdownString(value, CUSTOM_TRANSFORMERS);
      });
      isInitializedRef.current = true;
    }
  }, [value, editor]);

  return null;
}

export function SyncStatePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const lastExternalValueRef = useRef(value);

  useEffect(() => {
    if (value !== lastExternalValueRef.current) {
      editor.update(() => {
        const currentMarkdown = $convertToMarkdownString(CUSTOM_TRANSFORMERS);
        if (normalizeMarkdown(currentMarkdown) !== normalizeMarkdown(value)) {
          $getRoot().clear();
          $convertFromMarkdownString(value, CUSTOM_TRANSFORMERS);
        }
      });
      lastExternalValueRef.current = value;
    }
  }, [value, editor]);

  return null;
}

export function EditorOnChangePlugin({ onChange }: { onChange: (val: string) => void }) {
  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const markdown = $convertToMarkdownString(CUSTOM_TRANSFORMERS);
          onChange(markdown);
        });
      }}
    />
  );
}
