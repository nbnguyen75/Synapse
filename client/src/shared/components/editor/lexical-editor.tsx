import { useEffect, useRef, useState, useCallback } from 'react';

import {
   $getSelection,
   $isRangeSelection,
   FORMAT_TEXT_COMMAND,
   UNDO_COMMAND,
   REDO_COMMAND,
   COMMAND_PRIORITY_LOW,
   KEY_DOWN_COMMAND,
   SELECTION_CHANGE_COMMAND,
   $createParagraphNode,
   $getRoot,
   TextNode,
   ParagraphNode,
   type LexicalEditor as LexicalEditorType,
} from 'lexical';
import {
   HeadingNode,
   QuoteNode,
   $isHeadingNode,
   $createHeadingNode,
   $createQuoteNode,
   type HeadingTagType,
} from '@lexical/rich-text';
import {
   ListNode,
   ListItemNode,
   $isListNode,
   INSERT_UNORDERED_LIST_COMMAND,
   INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
   $convertFromMarkdownString,
   $convertToMarkdownString,
   TRANSFORMERS,
} from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $setBlocksType } from '@lexical/selection';

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Kbd } from '@/shared/components/ui/kbd';

import {
   Bold,
   Italic,
   Underline,
   Strikethrough,
   Code,
   List,
   ListOrdered,
   Heading1,
   Heading2,
   Heading3,
   Undo2,
   Redo2,
   Text,
   Quote,
   Keyboard,
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

// Helpers for block formatting
function formatHeadingBlock(editor: LexicalEditorType, tag: HeadingTagType) {
   editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         $setBlocksType(selection, () => $createHeadingNode(tag));
      }
   });
}

function formatParagraphBlock(editor: LexicalEditorType) {
   editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         $setBlocksType(selection, () => $createParagraphNode());
      }
   });
}

function formatQuoteBlock(editor: LexicalEditorType) {
   editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         $setBlocksType(selection, () => $createQuoteNode());
      }
   });
}

/**
 * KeyboardShortcutsPlugin captures standard Markdown & rich text keyboard shortcuts:
 * - Ctrl/Cmd + B: Bold
 * - Ctrl/Cmd + I: Italic
 * - Ctrl/Cmd + U: Underline
 * - Ctrl/Cmd + Shift + X: Strikethrough
 * - Ctrl/Cmd + E: Inline Code
 * - Ctrl/Cmd + Alt + 1/2/3: Heading 1/2/3
 * - Ctrl/Cmd + Alt + 0: Normal Text / Paragraph
 * - Ctrl/Cmd + Shift + 8 or Ctrl/Cmd + Shift + U: Bullet List
 * - Ctrl/Cmd + Shift + 7 or Ctrl/Cmd + Shift + O: Numbered List
 * - Ctrl/Cmd + Shift + Q: Quote Block
 */
function KeyboardShortcutsPlugin() {
   const [editor] = useLexicalComposerContext();

   useEffect(() => {
      return editor.registerCommand(
         KEY_DOWN_COMMAND,
         (event: KeyboardEvent) => {
            const { shiftKey, ctrlKey, metaKey, altKey, code } = event;
            const isMod = ctrlKey || metaKey;

            if (isMod) {
               // Format text commands (Bold, Italic, Underline, Strikethrough, Code)
               if (code === 'KeyB' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                  return true;
               }
               if (code === 'KeyI' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                  return true;
               }
               if (code === 'KeyU' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                  return true;
               }
               if (code === 'KeyX' && shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                  return true;
               }
               if (code === 'KeyE' && !shiftKey && !altKey) {
                  event.preventDefault();
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                  return true;
               }

               // Heading block formatting shortcuts (Ctrl+Alt+1, Ctrl+Alt+2, Ctrl+Alt+3, Ctrl+Alt+0)
               if (altKey && !shiftKey) {
                  if (code === 'Digit1' || code === 'Numpad1') {
                     event.preventDefault();
                     formatHeadingBlock(editor, 'h1');
                     return true;
                  }
                  if (code === 'Digit2' || code === 'Numpad2') {
                     event.preventDefault();
                     formatHeadingBlock(editor, 'h2');
                     return true;
                  }
                  if (code === 'Digit3' || code === 'Numpad3') {
                     event.preventDefault();
                     formatHeadingBlock(editor, 'h3');
                     return true;
                  }
                  if (code === 'Digit0' || code === 'Numpad0') {
                     event.preventDefault();
                     formatParagraphBlock(editor);
                     return true;
                  }
               }

               // Lists and Quotes formatting shortcuts
               if (shiftKey && !altKey) {
                  if (code === 'Digit8' || code === 'KeyU') {
                     event.preventDefault();
                     editor.dispatchCommand(
                        INSERT_UNORDERED_LIST_COMMAND,
                        undefined,
                     );
                     return true;
                  }
                  if (code === 'Digit7' || code === 'KeyO') {
                     event.preventDefault();
                     editor.dispatchCommand(
                        INSERT_ORDERED_LIST_COMMAND,
                        undefined,
                     );
                     return true;
                  }
                  if (code === 'KeyQ') {
                     event.preventDefault();
                     formatQuoteBlock(editor);
                     return true;
                  }
               }
            }
            return false;
         },
         COMMAND_PRIORITY_LOW,
      );
   }, [editor]);

   return null;
}

function ShortcutsHelpDialog() {
   return (
      <Dialog>
         <DialogTrigger
            render={
               <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 px-2 flex items-center gap-1 rounded text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors text-[10px] font-mono cursor-pointer ml-auto"
                  title="Keyboard Shortcuts & Markdown Syntax"
               />
            }
         >
            <Keyboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[480px] bg-background border border-border shadow-flat-lg rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <Keyboard className="h-4 w-4 text-primary" />
                  <span>Editor Shortcuts & Markdown Guide</span>
               </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
               <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2">
                     Text Formatting
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Bold</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+B</Kbd>
                           <Kbd>**text**</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Italic</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+I</Kbd>
                           <Kbd>*text*</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Underline</span>
                        <Kbd>Ctrl+U</Kbd>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Strikethrough</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+X</Kbd>
                           <Kbd>~~text~~</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50 col-span-2">
                        <span>Inline Code</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+E</Kbd>
                           <Kbd>`code`</Kbd>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2">
                     Structure & Headings
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Heading 1</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Alt+1</Kbd>
                           <Kbd># Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Heading 2</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Alt+2</Kbd>
                           <Kbd>## Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Heading 3</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Alt+3</Kbd>
                           <Kbd>### Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Normal Text</span>
                        <Kbd>Ctrl+Alt+0</Kbd>
                     </div>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2">
                     Lists & Blockquotes
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Bullet List</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+8</Kbd>
                           <Kbd>- Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Numbered List</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+7</Kbd>
                           <Kbd>1. Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50 col-span-2">
                        <span>Block Quote</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+Q</Kbd>
                           <Kbd>&gt; Space</Kbd>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}

function Toolbar() {
   const [editor] = useLexicalComposerContext();
   const [isBold, setIsBold] = useState(false);
   const [isItalic, setIsItalic] = useState(false);
   const [isUnderline, setIsUnderline] = useState(false);
   const [isStrikethrough, setIsStrikethrough] = useState(false);
   const [isCode, setIsCode] = useState(false);
   const [blockType, setBlockType] = useState<
      'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'ul' | 'ol'
   >('paragraph');

   const updateToolbar = useCallback(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
         setIsBold(selection.hasFormat('bold'));
         setIsItalic(selection.hasFormat('italic'));
         setIsUnderline(selection.hasFormat('underline'));
         setIsStrikethrough(selection.hasFormat('strikethrough'));
         setIsCode(selection.hasFormat('code'));

         const anchorNode = selection.anchor.getNode();
         const element =
            anchorNode.getKey() === 'root'
               ? anchorNode
               : anchorNode.getTopLevelElementOrThrow();

         if ($isHeadingNode(element)) {
            const tag = element.getTag();
            setBlockType(tag as 'h1' | 'h2' | 'h3');
         } else if ($isListNode(element)) {
            const listType = element.getListType();
            setBlockType(listType === 'number' ? 'ol' : 'ul');
         } else if (element.getType() === 'quote') {
            setBlockType('quote');
         } else {
            setBlockType('paragraph');
         }
      }
   }, []);

   useEffect(() => {
      return editor.registerCommand(
         SELECTION_CHANGE_COMMAND,
         () => {
            updateToolbar();
            return false;
         },
         COMMAND_PRIORITY_LOW,
      );
   }, [editor, updateToolbar]);

   useEffect(() => {
      return editor.registerUpdateListener(({ editorState }) => {
         editorState.read(() => {
            updateToolbar();
         });
      });
   }, [editor, updateToolbar]);

   const activeBtnClass =
      'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20';
   const inactiveBtnClass =
      'text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent';

   return (
      <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border bg-neutral-50/80 dark:bg-neutral-900/80 rounded-t-lg">
         {/* Bold */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${isBold ? activeBtnClass : inactiveBtnClass}`}
            title="Bold (Ctrl+B)"
         >
            <Bold className="h-3.5 w-3.5" />
         </Button>

         {/* Italic */}
         <Button
            type="button"
            variant="ghost"
            onClick={() =>
               editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${isItalic ? activeBtnClass : inactiveBtnClass}`}
            title="Italic (Ctrl+I)"
         >
            <Italic className="h-3.5 w-3.5" />
         </Button>

         {/* Underline */}
         <Button
            type="button"
            variant="ghost"
            onClick={() =>
               editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${isUnderline ? activeBtnClass : inactiveBtnClass}`}
            title="Underline (Ctrl+U)"
         >
            <Underline className="h-3.5 w-3.5" />
         </Button>

         {/* Strikethrough */}
         <Button
            type="button"
            variant="ghost"
            onClick={() =>
               editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${isStrikethrough ? activeBtnClass : inactiveBtnClass}`}
            title="Strikethrough (Ctrl+Shift+X)"
         >
            <Strikethrough className="h-3.5 w-3.5" />
         </Button>

         {/* Inline Code */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${isCode ? activeBtnClass : inactiveBtnClass}`}
            title="Inline Code (Ctrl+E)"
         >
            <Code className="h-3.5 w-3.5" />
         </Button>

         <div className="h-4 w-px bg-border mx-1" />

         {/* Paragraph */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatParagraphBlock(editor)}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'paragraph' ? activeBtnClass : inactiveBtnClass}`}
            title="Normal Paragraph (Ctrl+Alt+0)"
         >
            <Text className="h-3.5 w-3.5" />
         </Button>

         {/* Heading 1 */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatHeadingBlock(editor, 'h1')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'h1' ? activeBtnClass : inactiveBtnClass}`}
            title="Heading 1 (Ctrl+Alt+1)"
         >
            <Heading1 className="h-3.5 w-3.5" />
         </Button>

         {/* Heading 2 */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatHeadingBlock(editor, 'h2')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'h2' ? activeBtnClass : inactiveBtnClass}`}
            title="Heading 2 (Ctrl+Alt+2)"
         >
            <Heading2 className="h-3.5 w-3.5" />
         </Button>

         {/* Heading 3 */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatHeadingBlock(editor, 'h3')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'h3' ? activeBtnClass : inactiveBtnClass}`}
            title="Heading 3 (Ctrl+Alt+3)"
         >
            <Heading3 className="h-3.5 w-3.5" />
         </Button>

         <div className="h-4 w-px bg-border mx-1" />

         {/* Bullet List */}
         <Button
            type="button"
            variant="ghost"
            onClick={() =>
               editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            }
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'ul' ? activeBtnClass : inactiveBtnClass}`}
            title="Bullet List (Ctrl+Shift+8)"
         >
            <List className="h-3.5 w-3.5" />
         </Button>

         {/* Numbered List */}
         <Button
            type="button"
            variant="ghost"
            onClick={() =>
               editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'ol' ? activeBtnClass : inactiveBtnClass}`}
            title="Numbered List (Ctrl+Shift+7)"
         >
            <ListOrdered className="h-3.5 w-3.5" />
         </Button>

         {/* Quote */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => formatQuoteBlock(editor)}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${blockType === 'quote' ? activeBtnClass : inactiveBtnClass}`}
            title="Quote Block (Ctrl+Shift+Q)"
         >
            <Quote className="h-3.5 w-3.5" />
         </Button>

         <div className="h-4 w-px bg-border mx-1" />

         {/* Undo */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${inactiveBtnClass}`}
            title="Undo (Ctrl+Z)"
         >
            <Undo2 className="h-3.5 w-3.5" />
         </Button>

         {/* Redo */}
         <Button
            type="button"
            variant="ghost"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${inactiveBtnClass}`}
            title="Redo (Ctrl+Y)"
         >
            <Redo2 className="h-3.5 w-3.5" />
         </Button>

         {/* Shortcuts Helper Modal Button */}
         <ShortcutsHelpDialog />
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
