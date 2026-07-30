// ! Not used, reference only
import { m } from '@/paraglide/messages';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

import { ArchiveIcon, FileTextIcon, PlusIcon } from 'lucide-react';

type NotesEmptyVariant = 'active' | 'archived' | 'no-results';

interface NotesEmptyStateProps {
  variant: NotesEmptyVariant;
  onCreateClick?: () => void;
}

export default function NotesEmptyState({
  onCreateClick,
  variant,
}: NotesEmptyStateProps) {
  const icon =
    variant === 'archived' ? (
      <ArchiveIcon className="h-5 w-5" />
    ) : (
      <FileTextIcon className="h-5 w-5" />
    );

  const title =
    variant === 'no-results'
      ? m.notes_page_no_results()
      : variant === 'archived'
        ? m.notes_page_no_notes_archived()
        : m.notes_page_no_notes();

  const description =
    variant === 'no-results'
      ? ''
      : variant === 'archived'
        ? m.notes_page_no_notes_archived_desc()
        : m.notes_page_no_notes_desc();

  const showAction = variant === 'active' && onCreateClick;

  return (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {showAction && (
        <EmptyContent>
          <Button onClick={onCreateClick}>
            <PlusIcon className="h-4 w-4" />
            {m.notes_page_create()}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
