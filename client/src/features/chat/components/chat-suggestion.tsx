import { useCallback } from 'react';

import { Suggestion } from '@/components/ai-elements/suggestion';

export const SuggestionItem = ({
   suggestion,
   onClick,
}: {
   onClick: (suggestion: string) => void;
   suggestion: string;
}) => {
   const handleClick = useCallback(() => {
      onClick(suggestion);
   }, [onClick, suggestion]);

   return <Suggestion onClick={handleClick} suggestion={suggestion} />;
};
