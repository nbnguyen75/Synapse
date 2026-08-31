import { useEffect, useRef } from 'react';

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
  type TextMatchTransformer,
} from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, TextNode, ParagraphNode, $createTextNode } from 'lexical';
import { $createMarkNode, $isMarkNode, MarkNode } from '@lexical/mark';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';

export const ALLOWED_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  TextNode,
  ParagraphNode,
  LinkNode,
  AutoLinkNode,
  MarkNode,
  CodeNode,
  CodeHighlightNode,
];

const HIGHLIGHT_TRANSFORMER: TextMatchTransformer = {
  replace: (textNode, match) => {
    const markNode = $createMarkNode();
    textNode.replace(markNode);
    markNode.append($createTextNode(match[1]));
  },
  export: (node) => ($isMarkNode(node) ? `==${node.getTextContent()}==` : null),
  importRegExp: /==([^=]+)==$/,
  dependencies: [MarkNode],
  regExp: /==([^=]+)==$/,
  type: 'text-match',
  trigger: '=',
};

export const CUSTOM_TRANSFORMERS = [
  ...TRANSFORMERS.filter(
    (
      transformer,
    ): transformer is typeof transformer & {
      dependencies: (typeof ALLOWED_NODES)[number][];
    } => {
      const deps = (transformer as { dependencies?: unknown[] }).dependencies;
      return (
        !deps || deps.every((dep) => ALLOWED_NODES.includes(dep as (typeof ALLOWED_NODES)[number]))
      );
    },
  ),
  HIGHLIGHT_TRANSFORMER,
];

const URL_REGEX = /(https?:\/\/[^\s]+)/;
export const MATCHERS = [
  (text: string) => {
    const match = URL_REGEX.exec(text);
    if (!match) return null;
    return {
      length: match[0].length,
      index: match.index,
      text: match[0],
      url: match[0],
    };
  },
];

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
        const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
        if (normalize(currentMarkdown) !== normalize(value)) {
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
