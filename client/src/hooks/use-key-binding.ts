import { useEffect, useMemo, useRef } from 'react';

export type KeyBindingMap = Record<string, (event: KeyboardEvent) => void>;

export interface UseKeyBindingOptions {
  target?: EventTarget | null;
  ignoreWhenTyping?: boolean;
  allowWhenTyping?: string[];
  enabled?: boolean;
  capture?: boolean;
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingContext(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  return TYPING_TAGS.has(target.tagName) || target.isContentEditable;
}

export function getKeyCombo(event: KeyboardEvent): string {
  return [
    event.ctrlKey && 'ctrl',
    event.metaKey && 'meta',
    event.shiftKey && 'shift',
    event.altKey && 'alt',
    event.key.toLowerCase(),
  ]
    .filter(Boolean)
    .join('+');
}

/**
 * Binds a map of normalized key combos (e.g. `'ctrl+s'`) to handlers on a
 * target (default `window`). `preventDefault()` is always called synchronously
 * before the handler so browser defaults (e.g. Ctrl+S "Save Page As") are
 * blocked. Handlers are kept in a ref, so the latest closure is always used
 * without re-registering the listener. Pass `capture: true` to listen in the
 * capture phase (e.g. to intercept keys before a document-level listener).
 */
export function useKeyBinding(
  bindings: KeyBindingMap,
  options: UseKeyBindingOptions = {},
) {
  const {
    target = typeof window !== 'undefined' ? window : null,
    ignoreWhenTyping = true,
    allowWhenTyping = [],
    capture = false,
    enabled = true,
  } = options;

  const bindingsRef = useRef(bindings);
  const optionsRef = useRef({ ignoreWhenTyping, allowWhenTyping });

  useEffect(() => {
    bindingsRef.current = bindings;
    optionsRef.current = { ignoreWhenTyping, allowWhenTyping };
  });

  useEffect(() => {
    if (!enabled || !target) return;

    const handleKeyDown = ($event: Event) => {
      const event = $event as KeyboardEvent;
      const combo = getKeyCombo(event);
      const handler = bindingsRef.current[combo];
      if (!handler) return;

      const { ignoreWhenTyping: ignore, allowWhenTyping: allowed } =
        optionsRef.current;
      if (ignore && isTypingContext(event.target) && !allowed.includes(combo)) {
        return;
      }

      event.preventDefault();
      handler(event);
    };

    target.addEventListener('keydown', handleKeyDown, capture);
    return () => target.removeEventListener('keydown', handleKeyDown, capture);
  }, [target, enabled, capture]);
}

/** Expands the `mod` token into its cross-platform `ctrl`/`meta` combos. */
export function expandModKey(combo: string): string[] {
  if (!combo.includes('mod')) return [combo];
  return [combo.replace('mod', 'ctrl'), combo.replace('mod', 'meta')];
}

/**
 * Convenience wrapper: register one or more combos (which may use the `mod`
 * token) to a single handler.
 */
export function useKeyboardShortcut(
  combos: string[],
  handler: (event: KeyboardEvent) => void,
  options: UseKeyBindingOptions = {},
) {
  const bindings = useMemo<KeyBindingMap>(() => {
    const map: KeyBindingMap = {};
    for (const combo of combos) {
      for (const expanded of expandModKey(combo)) {
        map[expanded] = handler;
      }
    }
    return map;
  }, [combos, handler]);

  useKeyBinding(bindings, options);
}
