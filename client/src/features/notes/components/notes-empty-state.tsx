import type { ReactNode } from 'react';

import { m } from '@/paraglide/messages';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import { ArchiveIcon, FileTextIcon, Trash2Icon } from 'lucide-react';

type NotesEmptyVariant = 'active' | 'archived' | 'trash' | 'no-results';

interface NotesEmptyStateProps {
  variant: NotesEmptyVariant;
  children?: ReactNode;
}

const VARIANT_CONFIG: Record<
  NotesEmptyVariant,
  {
    description?: () => string;
    title: () => string;
    icon: ReactNode;
  }
> = {
  archived: {
    description: m.notes_page_no_notes_archived_desc,
    icon: <ArchiveIcon className="h-5 w-5" />,
    title: m.notes_page_no_notes_archived,
  },
  active: {
    icon: <FileTextIcon className="h-5 w-5" />,
    description: m.notes_page_no_notes_desc,
    title: m.notes_page_no_notes,
  },
  'no-results': {
    icon: <FileTextIcon className="h-5 w-5" />,
    title: m.notes_page_no_results,
  },
  trash: {
    icon: <Trash2Icon className="h-5 w-5" />,
    title: m.notes_empty_trash,
  },
};

export default function NotesEmptyState({
  children,
  variant,
}: NotesEmptyStateProps) {
  const { description, title, icon } = VARIANT_CONFIG[variant];

  return (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title()}</EmptyTitle>
        {description && <EmptyDescription>{description()}</EmptyDescription>}
      </EmptyHeader>

      {children && variant !== 'no-results' && (
        <EmptyContent>{children}</EmptyContent>
      )}
    </Empty>
  );
}
