import { useEffect } from 'react';

interface CommandPaletteProps {
   onFocusSearch: () => void;
   onNewNote: () => void;
}

export function CommandPalette({
   onFocusSearch,
   onNewNote,
}: CommandPaletteProps) {
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         const target = e.target as HTMLElement;
         if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
         )
            return;

         if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onNewNote();
         }

         if (e.key === '/') {
            e.preventDefault();
            onFocusSearch();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [onNewNote, onFocusSearch]);

   return null;
}
