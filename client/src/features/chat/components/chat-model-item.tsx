import type { Model } from '@/features/chat/lib/chat-mock-data';

import { useCallback } from 'react';

import {
   ModelSelectorItem,
   ModelSelectorLogo,
   ModelSelectorLogoGroup,
   ModelSelectorName,
} from '@/components/ai-elements/model-selector';

import { CheckIcon } from 'lucide-react';

export const ModelItem = ({
   isSelected,
   onSelect,
   m,
}: {
   onSelect: (id: string) => void;
   isSelected: boolean;
   m: Model;
}) => {
   const handleSelect = useCallback(() => {
      onSelect(m.id);
   }, [onSelect, m.id]);

   return (
      <ModelSelectorItem onSelect={handleSelect} value={m.id}>
         <ModelSelectorLogo provider={m.chefSlug} />
         <ModelSelectorName>{m.name}</ModelSelectorName>
         <ModelSelectorLogoGroup>
            {m.providers.map((provider) => (
               <ModelSelectorLogo key={provider} provider={provider} />
            ))}
         </ModelSelectorLogoGroup>
         {isSelected ? (
            <CheckIcon className="ml-auto size-4" />
         ) : (
            <div className="ml-auto size-4" />
         )}
      </ModelSelectorItem>
   );
};
