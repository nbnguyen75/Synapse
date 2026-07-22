import { Button } from '@/shared/components/ui/button';

import { X } from 'lucide-react';

interface TagFilterBarProps {
   onTagClick: (tag: string) => void;
   selectedTag: string;
   allTags: string[];
}

export function TagFilterBar({
   selectedTag,
   onTagClick,
   allTags,
}: TagFilterBarProps) {
   if (allTags.length === 0) return null;

   return (
      <div className="flex gap-1.5 overflow-x-auto border-b border-border px-6 py-2.5 scrollbar-none">
         {selectedTag && (
            <Button
               variant="outline"
               size="xs"
               type="button"
               onClick={() => onTagClick('')}
               className="cursor-pointer"
            >
               <X className="h-3 w-3" />
               Clear
            </Button>
         )}
         {allTags.map((tag) => (
            <Button
               key={tag}
               variant="outline"
               size="xs"
               type="button"
               onClick={() => onTagClick(selectedTag === tag ? '' : tag)}
               className={`cursor-pointer ${
                  selectedTag === tag
                     ? 'border-primary bg-primary text-primary-foreground'
                     : ''
               }`}
            >
               {tag}
            </Button>
         ))}
      </div>
   );
}
