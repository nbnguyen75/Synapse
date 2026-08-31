import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import type { EditorThemeClasses } from 'lexical';
import type { HTMLAttributes } from 'react';

import { useEffect } from 'react';

import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { InitialStatePlugin, SyncStatePlugin, EditorOnChangePlugin } from './lexical-plugins';
import { ALLOWED_NODES, CUSTOM_TRANSFORMERS, MATCHERS } from './lexical-config';
import BulletListShortcutPlugin from './lexical-bullet-list-shortcut-plugin';
import LinkShortcutDialogPlugin from './lexical-link-shortcut-dialog-plugin';
import KeyboardShortcutsPlugin from './lexical-keyboard-shortcuts';
import CompanionBridgePlugin from './companion-bridge-plugin';
import MarkdownPastePlugin from './markdown-paste-plugin';
import Toolbar from './lexical-toolbar';

const editorTheme: EditorThemeClasses = {
  codeHighlight: {
    'class-name': 'text-amber-600 dark:text-amber-400 font-semibold',
    keyword: 'text-purple-600 dark:text-purple-400 font-semibold',
    atrule: 'text-purple-600 dark:text-purple-400 font-medium',
    class: 'text-amber-600 dark:text-amber-400 font-semibold',
    comment: 'text-neutral-400 dark:text-neutral-500 italic',
    doctype: 'text-neutral-500 dark:text-neutral-400 italic',
    function: 'text-blue-600 dark:text-blue-400 font-medium',
    cdata: 'text-neutral-500 dark:text-neutral-400 italic',
    constant: 'text-red-600 dark:text-red-400 font-medium',
    boolean: 'text-red-600 dark:text-red-400 font-medium',
    important: 'text-red-600 dark:text-red-400 font-bold',
    punctuation: 'text-neutral-500 dark:text-neutral-400',
    tag: 'text-rose-600 dark:text-rose-400 font-medium',
    inserted: 'text-emerald-600 dark:text-emerald-400',
    selector: 'text-emerald-600 dark:text-emerald-400',
    builtin: 'text-emerald-600 dark:text-emerald-400',
    string: 'text-emerald-600 dark:text-emerald-400',
    variable: 'text-orange-600 dark:text-orange-400',
    char: 'text-emerald-600 dark:text-emerald-400',
    entity: 'text-orange-600 dark:text-orange-400',
    regex: 'text-orange-600 dark:text-orange-400',
    number: 'text-amber-600 dark:text-amber-400',
    operator: 'text-teal-600 dark:text-teal-400',
    property: 'text-blue-600 dark:text-blue-400',
    symbol: 'text-amber-600 dark:text-amber-400',
    deleted: 'text-red-600 dark:text-red-400',
    attr: 'text-blue-600 dark:text-blue-400',
  },
  text: {
    boldItalicUnderlineStrikethrough:
      'font-semibold text-foreground italic underline line-through underline-offset-4 opacity-80',
    boldUnderlineStrikethrough:
      'font-semibold text-foreground underline line-through underline-offset-4 opacity-80',
    code: 'font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground font-medium border border-border/40',
    italicUnderlineStrikethrough: 'italic underline line-through underline-offset-4 opacity-80',
    boldItalicUnderline: 'font-semibold text-foreground italic underline underline-offset-4',
    boldItalicStrikethrough: 'font-semibold text-foreground italic line-through opacity-70',
    underlineStrikethrough: 'underline line-through underline-offset-4 opacity-80',
    boldUnderline: 'font-semibold text-foreground underline underline-offset-4',
    boldStrikethrough: 'font-semibold text-foreground line-through opacity-70',
    italicUnderline: 'italic underline underline-offset-4',
    italicStrikethrough: 'italic line-through opacity-70',
    underline: 'underline underline-offset-4',
    strikethrough: 'line-through opacity-70',
    bold: 'font-semibold text-foreground',
    italic: 'italic',
  },
  list: {
    nested: {
      list: 'list-none pl-4 my-0.5',
      listitem: 'list-none pl-4',
    },
    ol: 'list-decimal pl-5 mb-2 space-y-1 marker:text-muted-foreground',
    ul: 'list-disc pl-5 mb-2 space-y-1 marker:text-muted-foreground',
    listitem: 'text-sm text-foreground/90 leading-relaxed my-0.5',
    listitemChecked: 'line-through opacity-60',
    checklist: 'list-none pl-0 my-1',
    listitemUnchecked: '',
  },
  heading: {
    h3: 'text-base font-semibold mt-3 mb-1.5 text-foreground tracking-tight',
    h1: 'text-xl font-bold mt-5 mb-2.5 text-foreground tracking-tight',
    h2: 'text-lg font-bold mt-4 mb-2 text-foreground tracking-tight',
  },
  mark: 'bg-yellow-200/80 dark:bg-yellow-500/30 text-foreground dark:text-yellow-200 px-1 py-0.5 rounded-sm font-medium',
  quote:
    'border-l-2 border-primary/80 pl-4 py-1 my-3 italic text-muted-foreground bg-primary/5 rounded-r-lg',
  code: 'bg-muted px-1.5 py-0.5 rounded-md font-mono text-xs text-foreground',
  paragraph: 'text-sm text-foreground/90 mb-2.5 leading-relaxed',
  link: 'text-primary underline cursor-pointer hover:opacity-80',
};

type LexicalEditorProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  onChange: (val: string) => void;
  'aria-placeholder'?: void; // ! Fix TS Error
  placeholder?: string;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  value: string;
  id?: string;
};

function SetEditablePlugin({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return null;
}

export default function LexicalEditor({
  placeholder = m.lexical_placeholder_default(),
  disabled = false,
  className = '',
  onChange,
  onBlur,
  value,
  id,
  ...restProps
}: LexicalEditorProps) {
  const initialConfig: InitialConfigType = {
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    namespace: 'NoteEditor',
    nodes: ALLOWED_NODES,
    editable: !disabled,
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
        <SetEditablePlugin disabled={disabled} />

        <AutoFocusPlugin />

        <Toolbar />

        <div className="relative min-h-60">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                {...restProps}
                spellCheck={false}
                className="min-h-60 max-h-125 overflow-y-auto px-4 py-3.5 outline-none focus:ring-0 text-sm scrollbar-none **:[[style]]:text-inherit! **:[[style]]:bg-transparent!"
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
          <CompanionBridgePlugin />
          <KeyboardShortcutsPlugin />
          <LinkShortcutDialogPlugin />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ClickableLinkPlugin />
          <TabIndentationPlugin />
          <CheckListPlugin />
          <MarkdownPastePlugin />
          <AutoLinkPlugin matchers={MATCHERS} />
          <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
          <BulletListShortcutPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}
