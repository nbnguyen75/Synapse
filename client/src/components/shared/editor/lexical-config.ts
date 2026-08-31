import { TRANSFORMERS, type TextMatchTransformer, type Transformer } from '@lexical/markdown';
import { $createMarkNode, $isMarkNode, MarkNode } from '@lexical/mark';
import { $createTextNode, ParagraphNode, TextNode } from 'lexical';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';

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

function isTransformerAllowed(transformer: Transformer): boolean {
  const deps = 'dependencies' in transformer ? transformer.dependencies : undefined;
  return !deps || deps.every((dep) => ALLOWED_NODES.some((node) => node === dep));
}

export const CUSTOM_TRANSFORMERS = [
  ...TRANSFORMERS.filter(isTransformerAllowed),
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
