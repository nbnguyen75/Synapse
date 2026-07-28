import { useState, useCallback, useEffect } from 'react';

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
  $isListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';

import { Button } from '@/components/ui/button';

import {
  formatHeadingBlock,
  formatParagraphBlock,
  formatQuoteBlock,
} from './lexical-keyboard-shortcuts';
import ShortcutsHelpDialog from './lexical-shortcuts-dialog';

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
} from 'lucide-react';

export default function Toolbar() {
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
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`h-7 w-7 flex items-center justify-center rounded transition-all cursor-pointer ${isItalic ? activeBtnClass : inactiveBtnClass}`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      {/* Underline */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
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
