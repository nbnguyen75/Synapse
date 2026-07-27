import { useEffect, useRef } from 'react';

import {
   $convertFromMarkdownString,
   $convertToMarkdownString,
   TRANSFORMERS,
} from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, TextNode, ParagraphNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';

const ALLOWED_NODES = [
   HeadingNode,
   QuoteNode,
   ListNode,
   ListItemNode,
   TextNode,
   ParagraphNode,
];

export const CUSTOM_TRANSFORMERS = TRANSFORMERS.filter(
   (
      transformer,
   ): transformer is typeof transformer & {
      dependencies: (typeof ALLOWED_NODES)[number][];
   } => {
      const deps = (transformer as { dependencies?: unknown[] }).dependencies;
      return (
         !deps ||
         deps.every((dep) =>
            ALLOWED_NODES.includes(dep as (typeof ALLOWED_NODES)[number]),
         )
      );
   },
);

export function InitialStatePlugin({ value }: { value: string }) {
   const [editor] = useLexicalComposerContext();
   const isInitialized = useRef(false);

   useEffect(() => {
      if (!isInitialized.current) {
         editor.update(() => {
            $getRoot().clear();
            $convertFromMarkdownString(value, CUSTOM_TRANSFORMERS);
         });
         isInitialized.current = true;
      }
   }, [value, editor]);

   return null;
}

export function SyncStatePlugin({ value }: { value: string }) {
   const [editor] = useLexicalComposerContext();
   const lastExternalValue = useRef(value);

   useEffect(() => {
      if (value !== lastExternalValue.current) {
         editor.update(() => {
            const currentMarkdown =
               $convertToMarkdownString(CUSTOM_TRANSFORMERS);
            const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
            if (normalize(currentMarkdown) !== normalize(value)) {
               $getRoot().clear();
               $convertFromMarkdownString(value, CUSTOM_TRANSFORMERS);
            }
         });
         lastExternalValue.current = value;
      }
   }, [value, editor]);

   return null;
}

export function EditorOnChangePlugin({
   onChange,
}: {
   onChange: (val: string) => void;
}) {
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
