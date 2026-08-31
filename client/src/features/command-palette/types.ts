import type { ElementType } from 'react';

export type CommandOutput =
  | {
      data: {
        tagsList: string[];
        tagsCount: number;
        pinned: number;
        active: number;
        drafts: number;
        total: number;
      };
      command: string;
      type: 'stats';
      title: string;
    }
  | { command: string; type: 'notes'; title: string }
  | { command: string; title: string; type: 'help' };

export interface CommandItem {
  action: () => Promise<void> | void;
  icon: ElementType;
  subtitle?: string;
  command?: string;
  title: string;
  id: string;
}

export interface NoteItem {
  updatedAt: string | Date;
  archived?: boolean;
  content?: string;
  pinned?: boolean;
  title: string;
  id: string;
}
