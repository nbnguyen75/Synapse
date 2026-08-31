import { useState, useCallback, useEffect } from 'react';

import { formatForDisplay } from '@tanstack/hotkeys';

import {
  $getSelection,
  $isRangeSelection,
  $findMatchingParent,
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
import { $isLinkNode } from '@lexical/link';

import { useShortcut } from '@/hooks/use-shortcut';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

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
  Link,
  InfoIcon,
} from 'lucide-react';

import {
  formatHeadingBlock,
  formatParagraphBlock,
  formatQuoteBlock,
} from './lexical-format-blocks';
import { TOGGLE_LINK_DIALOG_COMMAND } from './lexical-link-commands';
import ShortcutsHelpDialog from './lexical-shortcuts-dialog';

function comboTitle(
  withCombo: (args: { combo: string }) => string,
  withoutCombo: () => string,
  combo: undefined | string,
) {
  return combo ? withCombo({ combo: formatForDisplay(combo) }) : withoutCombo();
}

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState<
    'paragraph' | 'quote' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol'
  >('paragraph');

  const boldCombo = useShortcut('editor-bold').combos[0];
  const italicCombo = useShortcut('editor-italic').combos[0];
  const underlineCombo = useShortcut('editor-underline').combos[0];
  const strikethroughCombo = useShortcut('editor-strikethrough').combos[0];
  const codeCombo = useShortcut('editor-code').combos[0];
  const linkCombo = useShortcut('editor-link').combos[0];
  const paragraphCombo = useShortcut('editor-normal-text').combos[0];
  const heading1Combo = useShortcut('editor-heading1').combos[0];
  const heading2Combo = useShortcut('editor-heading2').combos[0];
  const heading3Combo = useShortcut('editor-heading3').combos[0];
  const bulletListCombo = useShortcut('editor-bullet-list').combos[0];
  const numberedListCombo = useShortcut('editor-numbered-list').combos[0];
  const quoteCombo = useShortcut('editor-blockquote').combos[0];

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      const anchorNode = selection.anchor.getNode();
      const hasLink = $findMatchingParent(anchorNode, $isLinkNode) !== null;
      setIsLink(hasLink);

      const element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        const tag = element.getTag();
        if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
          setBlockType(tag);
        }
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

  const activeBtnClass = 'bg-primary/15 text-primary font-medium hover:bg-primary/20 shadow-xs';
  const inactiveBtnClass =
    'text-muted-foreground hover:text-foreground hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60';

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border/60 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-t-xl sticky top-0 z-10">
      {/* Inline Formatting */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${isBold ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(m.lexical_tooltip_bold, m.keyboard_shortcuts_bold, boldCombo)}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${isItalic ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(m.lexical_tooltip_italic, m.keyboard_shortcuts_italic, italicCombo)}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${isUnderline ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_underline,
            m.keyboard_shortcuts_underline,
            underlineCombo,
          )}
        >
          <Underline className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${isStrikethrough ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_strikethrough,
            m.keyboard_shortcuts_strikethrough,
            strikethroughCombo,
          )}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${isCode ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(m.lexical_tooltip_code, m.keyboard_shortcuts_code, codeCombo)}
        >
          <Code className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(TOGGLE_LINK_DIALOG_COMMAND, undefined)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${isLink ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(m.lexical_tooltip_link, m.keyboard_shortcuts_link, linkCombo)}
        >
          <Link className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border/60 mx-1" />

      {/* Headings & Structure */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => formatParagraphBlock(editor)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'paragraph' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_paragraph,
            m.lexical_shortcuts_normal_text,
            paragraphCombo,
          )}
        >
          <Text className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => formatHeadingBlock(editor, 'h1')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'h1' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_heading1,
            m.lexical_shortcuts_heading1,
            heading1Combo,
          )}
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => formatHeadingBlock(editor, 'h2')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'h2' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_heading2,
            m.lexical_shortcuts_heading2,
            heading2Combo,
          )}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => formatHeadingBlock(editor, 'h3')}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'h3' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_heading3,
            m.lexical_shortcuts_heading3,
            heading3Combo,
          )}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border/60 mx-1" />

      {/* Lists & Quotes */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'ul' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_bullet_list,
            m.lexical_shortcuts_bullet_list,
            bulletListCombo,
          )}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'ol' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(
            m.lexical_tooltip_numbered_list,
            m.lexical_shortcuts_numbered_list,
            numberedListCombo,
          )}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => formatQuoteBlock(editor)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${blockType === 'quote' ? activeBtnClass : inactiveBtnClass}`}
          title={comboTitle(m.lexical_tooltip_quote, m.lexical_shortcuts_block_quote, quoteCombo)}
        >
          <Quote className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border/60 mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${inactiveBtnClass}`}
          title={m.lexical_tooltip_undo({ combo: formatForDisplay('mod+z') })}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className={`h-7 w-7 p-0 rounded-md transition-all cursor-pointer ${inactiveBtnClass}`}
          title={m.lexical_tooltip_redo({
            combo: formatForDisplay('mod+shift+z'),
          })}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <a
        href="https://www.markdownguide.org/basic-syntax"
        target="_blank"
        rel="noopener noreferrer"
        className="h-7 px-2 flex items-center gap-1 rounded text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors text-[10px] font-mono cursor-pointer"
        title={m.lexical_shortcuts_tooltip_info()}
      >
        <InfoIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{m.lexical_shortcuts_markdown()}</span>
      </a>

      <ShortcutsHelpDialog />
    </div>
  );
}
