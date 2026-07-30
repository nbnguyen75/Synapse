import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Fragment } from 'react/jsx-runtime';

import { NoteCardSkeleton } from '@/features/notes/components';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes')({
  pendingComponent: () => (
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Fragment key={i}>
          <NoteCardSkeleton />
        </Fragment>
      ))}
    </div>
  ),
  staticData: {
    breadcrumb: () => m.notes_page_breadcrumb_notes(),
  },
  component: () => <Outlet />,
});
