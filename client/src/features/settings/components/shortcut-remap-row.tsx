import type { KeyboardShortcutEntry } from '@/config/keyboard-shortcuts';
import type { ReactHotkeyRecorder } from '@tanstack/react-hotkeys';

import { useEffect, useRef, useState } from 'react';

import { parseHotkey } from '@tanstack/hotkeys';
import { useHotkeyRecorder } from '@tanstack/react-hotkeys';

import { useShortcut } from '@/hooks/use-shortcut';

import { useShortcutsStore } from '@/store/shortcuts-store';

import {
  findShortcutConflict,
  toRegistryCombo,
} from '@/config/keyboard-shortcuts';

import { m } from '@/paraglide/messages';

import { KeyCombo } from '@/components/shared/key-combo';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShortcutRemapRowProps {
  entry: KeyboardShortcutEntry;
}

export function ShortcutRemapRow({ entry }: ShortcutRemapRowProps) {
  const overrides = useShortcutsStore((state) => state.overrides);
  const setBinding = useShortcutsStore((state) => state.setBinding);
  const resetBinding = useShortcutsStore((state) => state.resetBinding);
  const { combos } = useShortcut(entry.id);

  const [isCapturing, setIsCapturing] = useState(false);
  const [attempted, setAttempted] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stopCapture = () => {
    setIsCapturing(false);
    setAttempted('');
    setError(null);
  };

  const recorderRef = useRef<ReactHotkeyRecorder | null>(null);

  const recorder = useHotkeyRecorder({
    onRecord: (hotkey) => {
      if (!hotkey) {
        stopCapture();
        return;
      }

      if (parseHotkey(hotkey).modifiers.length === 0) {
        setAttempted(hotkey);
        setError(m.settings_shortcuts_requires_modifier());
        recorderRef.current?.startRecording();
        return;
      }

      const normalized = toRegistryCombo(hotkey);

      const conflict = findShortcutConflict([normalized], entry.id, overrides);
      if (conflict) {
        setAttempted(hotkey);
        setError(m.settings_shortcuts_conflict({ shortcut: conflict.label() }));
        recorderRef.current?.startRecording();
        return;
      }

      setBinding(entry.id, [normalized]);
      stopCapture();
    },
    onCancel: stopCapture,
    ignoreInputs: false,
  });

  useEffect(() => {
    recorderRef.current = recorder;
    return () => {
      recorderRef.current = null;
    };
  }, [recorder]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-background p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{entry.label()}</p>
        {error && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isCapturing ? (
          <>
            <Input
              autoFocus
              readOnly
              placeholder={m.settings_shortcuts_capturing()}
              value={recorder.recordedHotkey ?? attempted}
              className="h-8 w-44 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => recorder.cancelRecording()}
              className="h-8 text-xs"
            >
              {m.settings_shortcuts_cancel()}
            </Button>
          </>
        ) : (
          <>
            {combos.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                {m.settings_shortcuts_disabled()}
              </span>
            ) : (
              <KeyCombo combo={combos[0]} />
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setAttempted('');
                setIsCapturing(true);
                recorder.startRecording();
              }}
              className="h-8 text-xs"
            >
              {m.settings_shortcuts_remap()}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={combos.length === 0}
              onClick={() => setBinding(entry.id, [])}
              className="h-8 text-xs"
            >
              {m.settings_shortcuts_disable()}
            </Button>

            {overrides[entry.id] !== undefined && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => resetBinding(entry.id)}
                className="h-8 text-xs"
              >
                {m.settings_shortcuts_reset()}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
