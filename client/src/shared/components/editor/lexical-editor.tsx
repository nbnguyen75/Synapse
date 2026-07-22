import { useEffect, useRef } from 'react';

import {
   $getSelection,
   $isRangeSelection,
   FORMAT_TEXT_COMMAND,
   UNDO_COMMAND,
   REDO_COMMAND,
   $createParagraphNode,
   $getRoot,
   TextNode,
   ParagraphNode,
} from 'lexical';
import {
   $convertFromMarkdownString,
   $convertToMarkdownString,
   TRANSFORMERS,
} from '@lexical/markdown';
import {
   $createHeadingNode,
   $createQuoteNode,
   type HeadingTagType,
} from '@lexical/rich-text';
import {
   INSERT_UNORDERED_LIST_COMMAND,
   INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';

import { Button } from '@/shared/components/ui/button';

import {
   Bold,
   Italic,
   List,
   ListOrdered,
   Heading1,
   Heading2,
   Heading3,
   Undo2,
   Redo2,
   Text,
   Quote,
} from 'lucide-react';

const ALLOWED_NODES = [
   HeadingNode,
   QuoteNode,
   ListNode,
   ListItemNode,
   TextNode,
   ParagraphNode,
];

const CUSTOM_TRANSFORMERS = TRANSFORMERS.filter(
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

const editorTheme = {
   heading: {
      h3: 'text-base font-semibold mt-2 mb-1 text-foreground tracking-tight',
      h1: 'text-xl font-bold mt-4 mb-2 text-foreground tracking-tight',
      h2: 'text-lg font-bold mt-3 mb-2 text-foreground tracking-tight',
   },
   list: {
      nested: {
         listitem: 'list-none pl-4',
      },
      listitem: 'text-sm text-foreground leading-relaxed',
      ol: 'list-decimal pl-5 mb-2 space-y-1',
      ul: 'list-disc pl-5 mb-2 space-y-1',
   },
   text: {
      strikethrough: 'line-through',
      underline: 'underline',
      bold: 'font-bold',
      italic: 'italic',
   },
   quote: 'border-l-4 border-primary/40 pl-4 my-3 italic text-muted-foreground bg-accent/5 py-1 rounded-r-md',
   paragraph: 'text-sm text-foreground mb-2 leading-relaxed',
};

function InitialStatePlugin({ value }: { value: string }) {
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

function SyncStatePlugin({ value }: { value: string }) {
   const [editor] = useLexicalComposerContext();
   const lastExternalValue = useRef(value);

   useEffect(() => {
      if (value !== lastExternalValue.current) {
         editor.update(() => {
            const currentMarkdown =
               $convertToMarkdownString(CUSTOM_TRANSFORMERS);
            // Normalize whitespace for a resilient content match check
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

function EditorOnChangePlugin({
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

function Toolbar() {
   const [editor] = useLexicalComposerContext();

   const formatHeading = (tag: HeadingTagType) => {
      editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode(tag));
         }
      });
   };

   const formatParagraph = () => {
      editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
         }
      });
   };

   const formatBulletList = () => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
   };

   const formatNumberedList = () => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
   };

   const formatQuote = () => {
      editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
         }
      });
   };

   return (
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-border bg-neutral-50 dark:bg-neutral-900 rounded-t-lg">
         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Bold"
         >
            <Bold className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={() =>
               editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Italic"
         >
            <Italic className="h-3.5 w-3.5" />
         </Button>
         <div className="h-4 w-px bg-border mx-1" />

         <Button
            type="button"
            variant="ghost"
            onClick={formatParagraph}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Normal Text"
         >
            <Text className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatHeading('h1')}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Heading 1"
         >
            <Heading1 className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatHeading('h2')}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Heading 2"
         >
            <Heading2 className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatHeading('h3')}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Heading 3"
         >
            <Heading3 className="h-3.5 w-3.5" />
         </Button>
         <div className="h-4 w-px bg-border mx-1" />

         <Button
            type="button"
            variant="ghost"
            onClick={formatBulletList}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Bullet List"
         >
            <List className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={formatNumberedList}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Numbered List"
         >
            <ListOrdered className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={formatQuote}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Quote"
         >
            <Quote className="h-3.5 w-3.5" />
         </Button>

         <div className="h-4 w-px bg-border mx-1 ml-auto" />

         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Undo"
         >
            <Undo2 className="h-3.5 w-3.5" />
         </Button>
         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-primary/10 text-neutral-500 hover:text-primary transition-colors cursor-pointer"
            title="Redo"
         >
            <Redo2 className="h-3.5 w-3.5" />
         </Button>
      </div>
   );
}

export default function LexicalEditor({
   placeholder = 'Write your note here (Markdown supported)...',
   className = '',
   onChange,
   value,
   id,
}: {
   onChange: (val: string) => void;
   placeholder?: string;
   className?: string;
   value: string;
   id?: string;
}) {
   const initialConfig = {
      onError: (error: Error) => {
         console.error('Lexical Error:', error);
      },
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      namespace: 'NoteEditor',
      theme: editorTheme,
   };

   return (
      <div
         className={`border border-border rounded-lg bg-background flex flex-col focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200 ${className}`}
         id={id}
      >
         <LexicalComposer initialConfig={initialConfig}>
            <Toolbar />
            <div className="relative flex-1 flex flex-col min-h-40">
               <RichTextPlugin
                  contentEditable={
                     <ContentEditable className="flex-1 max-h-87.5 overflow-y-auto px-4 py-3 outline-none focus:ring-0 text-sm scrollbar-none" />
                  }
                  placeholder={
                     <div className="absolute top-3 left-4 text-neutral-400 text-sm pointer-events-none select-none">
                        {placeholder}
                     </div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
               />
               <InitialStatePlugin value={value} />
               <SyncStatePlugin value={value} />
               <EditorOnChangePlugin onChange={onChange} />
               <HistoryPlugin />
               <ListPlugin />
               <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
            </div>
         </LexicalComposer>
      </div>
   );
}
