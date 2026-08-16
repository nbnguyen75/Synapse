import { useEffect } from 'react';

import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  mergeRegister,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';

/**
 * Matches a caret sitting right after a bullet-list marker at the start of a
 * root-level paragraph (`- `, `* ` or `+ `).
 */
const BULLET_MARKER_REGEX = /^[-+*] $/;

/**
 * Returns true when the current selection is a collapsed caret at the end of a
 * bullet marker (`- `) at the start of a root-level paragraph. Must be called
 * inside `editor.update` (or `editorState.read`) so `$getSelection` is valid.
 */
function $hasBulletMarkerAtCaret(): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

  const anchor = selection.anchor;
  if (anchor.type !== 'text') return false;

  const anchorNode = anchor.getNode();
  if (!$isTextNode(anchorNode)) return false;

  const text = anchorNode.getTextContent();
  const offset = anchor.offset;
  if (offset < 2 || text[offset - 1] !== ' ') return false;
  if (!BULLET_MARKER_REGEX.test(text.slice(0, offset))) return false;

  const parentNode = anchorNode.getParent();
  if (parentNode === null || parentNode.getFirstChild() !== anchorNode) {
    return false;
  }
  if (parentNode.getParent() === null) return false;
  return $isRootOrShadowRoot(parentNode.getParent());
}

/**
 * Removes the `- ` marker from the anchor text node (selection moves to the
 * marker start) and reports whether it did. Must be called inside
 * `editor.update`.
 */
function $removeBulletMarker(): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

  const anchor = selection.anchor;
  if (anchor.type !== 'text') return false;

  const anchorNode = anchor.getNode();
  if (!$isTextNode(anchorNode)) return false;

  const text = anchorNode.getTextContent();
  const offset = anchor.offset;
  if (offset < 2 || text[offset - 1] !== ' ') return false;
  if (!BULLET_MARKER_REGEX.test(text.slice(0, offset))) return false;

  anchorNode.spliceText(0, offset, '', true);
  return true;
}

/**
 * Converts `- ` (plus `* `/`+ `) at line start into an unordered list,
 * including when a Vietnamese IME swallows the space keydown during
 * composition. Two complementary paths, each a no-op when the other (or
 * `MarkdownShortcutPlugin`) already converted:
 *
 * - `KEY_DOWN_COMMAND` for Space when no composition is active — the direct,
 *   event-driven path that runs before the browser inserts the space.
 * - an update listener registered after `MarkdownShortcutPlugin`'s, catching
 *   spaces that were committed as part of an IME composition (their keydown
 *   never reached the editor while `editor.isComposing()`).
 */
export default function BulletListShortcutPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          if (event.isComposing || event.key !== ' ') return false;

          let transformed = false;
          editor.update(() => {
            transformed = $removeBulletMarker();
          });
          if (!transformed) return false;

          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
          event.preventDefault();
          event.stopPropagation();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        if (editor.isComposing()) return;

        const hasBulletMarker = editorState.read(() =>
          $hasBulletMarkerAtCaret(),
        );
        if (!hasBulletMarker) return;

        editor.update(() => {
          $removeBulletMarker();
        });
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }),
    );
  }, [editor]);

  return null;
}
