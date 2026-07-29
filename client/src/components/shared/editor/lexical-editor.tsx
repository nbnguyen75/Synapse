import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';

import { cn } from '@/lib/utils';

import {
  CUSTOM_TRANSFORMERS,
  InitialStatePlugin,
  SyncStatePlugin,
  EditorOnChangePlugin,
} from './lexical-plugins';
import KeyboardShortcutsPlugin from './lexical-keyboard-shortcuts';
import Toolbar from './lexical-toolbar';

const editorTheme = {
  text: {
    code: 'font-body bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded text-xs text-primary font-medium border border-border/40',
    underline: 'underline underline-offset-4',
    strikethrough: 'line-through opacity-70',
    bold: 'font-semibold text-foreground',
    italic: 'italic',
  },
  list: {
    ol: 'list-decimal pl-5 mb-2 space-y-1 marker:text-muted-foreground',
    ul: 'list-disc pl-5 mb-2 space-y-1 marker:text-muted-foreground',
    listitem: 'text-sm text-foreground/90 leading-relaxed',
    nested: {
      listitem: 'list-none pl-4',
    },
  },
  heading: {
    h3: 'text-base font-semibold mt-3 mb-1.5 text-foreground tracking-tight',
    h1: 'text-xl font-bold mt-5 mb-2.5 text-foreground tracking-tight',
    h2: 'text-lg font-bold mt-4 mb-2 text-foreground tracking-tight',
  },
  quote:
    'border-l-2 border-primary/80 pl-4 py-1 my-3 italic text-muted-foreground bg-primary/5 rounded-r-lg',
  paragraph: 'text-sm text-foreground/90 mb-2.5 leading-relaxed',
};

export default function LexicalEditor({
  placeholder = 'Write your note content here (Markdown supported)...',
  disabled = false,
  className = '',
  onChange,
  onBlur,
  value,
  id,
}: {
  onChange: (val: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
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
      className={cn(
        'border border-border/80 rounded-xl bg-background flex flex-col focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200 shadow-xs overflow-hidden',
        className,
      )}
      id={id}
      onBlur={onBlur}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative min-h-60">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-60 max-h-125 overflow-y-auto px-4 py-3.5 outline-none focus:ring-0 text-sm scrollbar-none"
                disabled={disabled}
              />
            }
            placeholder={
              <div className="absolute top-3.5 left-4 text-muted-foreground/50 text-sm pointer-events-none select-none">
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
