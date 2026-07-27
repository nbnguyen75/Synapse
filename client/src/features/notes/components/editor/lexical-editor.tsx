import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';

import {
   CUSTOM_TRANSFORMERS,
   InitialStatePlugin,
   SyncStatePlugin,
   EditorOnChangePlugin,
} from './lexical-plugins';
import KeyboardShortcutsPlugin from './lexical-keyboard-shortcuts';
import Toolbar from './lexical-toolbar';

const editorTheme = {
   heading: {
      h3: 'text-base font-semibold mt-2 mb-1 text-foreground tracking-tight',
      h1: 'text-xl font-bold mt-4 mb-2 text-foreground tracking-tight',
      h2: 'text-lg font-bold mt-3 mb-2 text-foreground tracking-tight',
   },
   text: {
      code: 'font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs text-primary',
      strikethrough: 'line-through',
      underline: 'underline',
      bold: 'font-bold',
      italic: 'italic',
   },
   list: {
      nested: {
         listitem: 'list-none pl-4',
      },
      listitem: 'text-sm text-foreground leading-relaxed',
      ol: 'list-decimal pl-5 mb-2 space-y-1',
      ul: 'list-disc pl-5 mb-2 space-y-1',
   },
   quote: 'border-l-4 border-primary/40 pl-4 my-3 italic text-muted-foreground bg-accent/5 py-1 rounded-r-md',
   paragraph: 'text-sm text-foreground mb-2 leading-relaxed',
};

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
                     <ContentEditable className="flex-1 min-h-40 max-h-87.5 overflow-y-auto px-4 py-3 outline-none focus:ring-0 text-sm scrollbar-none" />
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
               <KeyboardShortcutsPlugin />
               <HistoryPlugin />
               <ListPlugin />
               <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
            </div>
         </LexicalComposer>
      </div>
   );
}
