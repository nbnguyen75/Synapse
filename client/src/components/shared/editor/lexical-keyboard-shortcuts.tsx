import type { ShortcutId } from '@/config/keyboard-shortcuts';

import { useEffect, useMemo, useRef } from 'react';

import { normalizeHotkey, normalizeHotkeyFromEvent } from '@tanstack/hotkeys';

import {
  $createParagraphNode,
  $findMatchingParent,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  KEY_DOWN_COMMAND,
  type LexicalEditor as LexicalEditorType,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  type HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $isMarkNode,
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
} from '@lexical/mark';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $setBlocksType } from '@lexical/selection';

import { useShortcutsStore } from '@/store/shortcuts-store';

import { getEffectiveCombos } from '@/config/keyboard-shortcuts';

import { TOGGLE_LINK_DIALOG_COMMAND } from './lexical-link-shortcut-dialog-plugin';

export type { HeadingTagType };

const EDITOR_SHORTCUT_IDS = [
  'editor-bold',
  'editor-italic',
  'editor-underline',
  'editor-strikethrough',
  'editor-code',
  'editor-heading1',
  'editor-heading2',
  'editor-heading3',
  'editor-normal-text',
  'editor-bullet-list',
  'editor-numbered-list',
  'editor-blockquote',
  'editor-link',
  'editor-highlight',
] as const satisfies readonly ShortcutId[];

type EditorShortcutId = (typeof EDITOR_SHORTCUT_IDS)[number];

const HIGHLIGHT_MARK_ID = 'synapse-highlight';

export function formatHeadingBlock(
  editor: LexicalEditorType,
  tag: HeadingTagType,
) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createHeadingNode(tag));
    }
  });
}

export function formatParagraphBlock(editor: LexicalEditorType) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
}

export function formatQuoteBlock(editor: LexicalEditorType) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createQuoteNode());
    }
  });
}

function formatHighlightBlock(editor: LexicalEditorType) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    const existingMark = $findMatchingParent(anchorNode, $isMarkNode);
    if (existingMark !== null) {
      $unwrapMarkNode(existingMark);
      return;
    }

    $wrapSelectionInMarkNode(selection, false, HIGHLIGHT_MARK_ID);
  });
}

/**
 * Matches a keyboard event against the candidate combos. Events emitted while
 * an IME composition is active (`event.isComposing`) never match — modifiers
 * and keys during Vietnamese/other composition must not trigger editor
 * shortcuts.
 */
function matchesCombo(event: KeyboardEvent, candidates: string[]): boolean {
  if (event.isComposing) return false;
  const hotkey = normalizeHotkeyFromEvent(event);
  return candidates.some((candidate) => normalizeHotkey(candidate) === hotkey);
}

export default function KeyboardShortcutsPlugin() {
  const [editor] = useLexicalComposerContext();
  const overrides = useShortcutsStore((state) => state.overrides);

  const actionCombos = useMemo(
    () =>
      Object.fromEntries(
        EDITOR_SHORTCUT_IDS.map((id) => [
          id,
          getEffectiveCombos(id, overrides),
        ]),
      ) as Record<EditorShortcutId, string[]>,
    [overrides],
  );

  const actionCombosRef = useRef(actionCombos);
  const dispatchRef = useRef<(action: EditorShortcutId) => void>(() => {});

  useEffect(() => {
    actionCombosRef.current = actionCombos;
  }, [actionCombos]);

  useEffect(() => {
    dispatchRef.current = (action) => {
      switch (action) {
        case 'editor-bold':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          break;
        case 'editor-italic':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          break;
        case 'editor-underline':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          break;
        case 'editor-strikethrough':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          break;
        case 'editor-code':
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          break;
        case 'editor-heading1':
          formatHeadingBlock(editor, 'h1');
          break;
        case 'editor-heading2':
          formatHeadingBlock(editor, 'h2');
          break;
        case 'editor-heading3':
          formatHeadingBlock(editor, 'h3');
          break;
        case 'editor-normal-text':
          formatParagraphBlock(editor);
          break;
        case 'editor-bullet-list':
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          break;
        case 'editor-numbered-list':
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
          break;
        case 'editor-blockquote':
          formatQuoteBlock(editor);
          break;
        case 'editor-link':
          editor.dispatchCommand(TOGGLE_LINK_DIALOG_COMMAND, undefined);
          break;
        case 'editor-highlight':
          formatHighlightBlock(editor);
          break;
      }
    };
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        for (const id of EDITOR_SHORTCUT_IDS) {
          if (!matchesCombo(event, actionCombosRef.current[id])) continue;
          event.preventDefault();
          event.stopPropagation();
          dispatchRef.current(id);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
