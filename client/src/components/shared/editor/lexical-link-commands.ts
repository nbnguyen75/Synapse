import type { LexicalCommand } from 'lexical';

import { createCommand } from 'lexical';

export const TOGGLE_LINK_DIALOG_COMMAND: LexicalCommand<void> = createCommand(
  'TOGGLE_LINK_DIALOG_COMMAND',
);
