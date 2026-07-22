import type { AppTab } from './types';

import { FileText, MessageSquare, Tag, Archive } from 'lucide-react';

import { m } from '@/paraglide/messages';

export interface NavItem {
   group: 'navigation' | 'management';
   icon: typeof FileText;
   labelKey: string;
   tab: AppTab;
}

export const NAV_ITEMS: NavItem[] = [
   {
      labelKey: 'sidebar_notes',
      group: 'navigation',
      icon: FileText,
      tab: 'notes',
   },
   {
      labelKey: 'sidebar_chat',
      icon: MessageSquare,
      group: 'navigation',
      tab: 'chat',
   },
   {
      labelKey: 'sidebar_archived',
      group: 'management',
      tab: 'archived',
      icon: Archive,
   },
   { labelKey: 'sidebar_tags', group: 'management', tab: 'tags', icon: Tag },
];

export const LABEL_MAP: Record<string, () => string> = {
   sidebar_view_profile: m.sidebar_view_profile,
   sidebar_archived: m.sidebar_archived,
   sidebar_settings: m.sidebar_settings,
   sidebar_notes: m.sidebar_notes,
   sidebar_chat: m.sidebar_chat,
   sidebar_tags: m.sidebar_tags,
};

export const ACTIVE_TAB_LABEL: Record<AppTab, () => string> = {
   profile: m.sidebar_view_profile,
   archived: m.sidebar_archived,
   settings: m.sidebar_settings,
   notes: m.sidebar_notes,
   chat: m.sidebar_chat,
   tags: m.sidebar_tags,
};
