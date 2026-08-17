import type { NoteViewMode } from '@/features/notes/types';

import { useEffect, useRef } from 'react';

import {
  NotesList,
  NoteCard,
  NotesBulkActions,
} from '@/features/notes/components';
import { NOTE_SORT_OPTIONS } from '@/features/notes/constants';
import { useNotesView } from '@/features/notes/hooks';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderRow,
  PageHeaderTitle,
  PageHeaderToolbar,
} from '@/components/shared/page-header';

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react';

interface NotesViewPageProps {
  viewMode: NoteViewMode;
}

export default function NotesViewPage({ viewMode }: NotesViewPageProps) {
  const { selection, infinite, actions, config, status, state, data } =
    useNotesView(viewMode);

  const { isBulkActive, sort } = state;
  const { notes } = data;
  const { isLoading } = status;
  const { toggleSelectRange, clearSelection, toggleSelect, selectedIds } =
    selection;
  const { emptyVariant, description, title } = config;
  const { executeEmptyTrash, executeBulkAction, navigateToCreate, changeSort } =
    actions;
  const { isFetchingNextPage, fetchNextPage, hasNextPage } = infinite;

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          !isFetchingNextPage
        ) {
          void fetchNextPage();
        }
      },
      { root: scrollRef.current, rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderContent>
            <PageHeaderTitle className="text-foreground">
              {title}
            </PageHeaderTitle>
            <PageHeaderDescription>{description}</PageHeaderDescription>
          </PageHeaderContent>

          <PageHeaderActions>
            <PageHeaderToolbar>
              {viewMode === 'trash' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5 text-xs cursor-pointer"
                  disabled={selectedIds.size < 1}
                  onClick={executeEmptyTrash}
                >
                  <Trash2Icon className="size-3.5" />
                  {m.trash_page_empty()}
                </Button>
              )}

              <Select
                items={NOTE_SORT_OPTIONS}
                defaultValue={sort}
                onValueChange={(value) => changeSort(value ?? undefined)}
              >
                <SelectTrigger className="w-48 h-9 text-sm gap-1">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="w-48" align="end">
                  {NOTE_SORT_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* <Separator orientation="vertical" className="h-6" /> */}

              {/* <NotesViewToggle value={viewModeUI} onChange={setViewModeUI} /> */}
            </PageHeaderToolbar>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>

      {/* <NotesTagFilter /> */}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container"
        >
          <NotesList
            isLoading={isLoading}
            notes={notes}
            emptyVariant={emptyVariant}
            onCreateClick={(e) => {
              e.preventDefault();
              navigateToCreate();
            }}
            renderItem={(note) => (
              <NoteCard
                note={note}
                viewMode={viewMode}
                isSelected={selectedIds.has(note.id)}
                onToggleSelect={toggleSelect}
                onSelectRange={(id) =>
                  toggleSelectRange(
                    id,
                    notes.map((n) => n.id),
                  )
                }
              />
            )}
          />

          {notes.length > 0 && hasNextPage && (
            <div
              ref={sentinelRef}
              className="flex h-12 items-center justify-center py-4"
            >
              {isFetchingNextPage && (
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        <NotesBulkActions
          viewMode={viewMode}
          notes={notes}
          selectedIds={selectedIds}
          onClearSelection={clearSelection}
          onBulkAction={executeBulkAction}
        />
      </div>

      <Button
        onClick={navigateToCreate}
        className={cn(
          'fixed bottom-6 right-6 z-40 size-12 rounded-full shadow-lg md:hidden cursor-pointer transition-all duration-300',
          isBulkActive && 'scale-0 pointer-events-none opacity-0',
        )}
        size="icon"
      >
        <PlusIcon className="size-5" />
      </Button>
    </div>
  );
}
