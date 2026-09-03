import { NoteCardSkeleton } from '@/features/notes/components';

interface NotesListCardSkeletonProps {
  loadingCardCount?: number;
}

export default function NotesListCardSkeleton({
  loadingCardCount = 6,
}: NotesListCardSkeletonProps) {
  return (
    <div className="grid gap-4 grid-cols-1 @4xl:grid-cols-2 @8xl:grid-cols-3">
      {Array.from({ length: loadingCardCount }).map((_, index) => (
        <NoteCardSkeleton key={`note-card-template-${index + 1}`} />
      ))}
    </div>
  );
}
