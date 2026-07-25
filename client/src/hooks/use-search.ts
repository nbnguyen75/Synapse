import {
   useCallback,
   useEffect,
   useMemo,
   useState,
   type ChangeEvent,
} from 'react';

import { debounce } from 'lodash';

interface UseSearchOptions {
   defaultValue?: string;
   delay?: number;
}

export function useSearchInput({
   defaultValue = '',
   delay = 500,
}: UseSearchOptions = {}) {
   const [value, setValue] = useState(defaultValue);
   const [debouncedValue, setDebouncedValue] = useState(defaultValue);

   const debouncedSet = useMemo(
      () => debounce((v: string) => setDebouncedValue(v), delay),
      [delay],
   );

   useEffect(() => {
      return () => debouncedSet.cancel();
   }, [debouncedSet]);

   const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
         const v = e.target.value;
         setValue(v);
         debouncedSet(v);
      },
      [debouncedSet],
   );

   const clear = useCallback(() => {
      debouncedSet.cancel();
      setValue('');
      setDebouncedValue('');
   }, [debouncedSet]);

   return { setValue: handleChange, debouncedValue, value, clear };
}
