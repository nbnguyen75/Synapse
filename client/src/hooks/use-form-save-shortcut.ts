import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';

interface UseFormSaveShortcutOptions<T extends FieldValues> {
  onSubmit: (data: T) => void;
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  enabled?: boolean;
}

/**
 * Binds the remappable `save-note` shortcut to a form's submit handler,
 * including while the user is typing (`allowWhenTyping` maps to
 * `ignoreInputs: false`).
 */
export function useFormSaveShortcut<T extends FieldValues>({
  enabled = true,
  isSubmitting,
  onSubmit,
  form,
}: UseFormSaveShortcutOptions<T>) {
  useHotkeyShortcut(
    'save-note',
    () => {
      if (isSubmitting) return;
      void form.handleSubmit(onSubmit)();
    },
    { allowWhenTyping: true, enabled },
  );
}
