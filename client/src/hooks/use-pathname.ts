import { useEffect, useState } from 'react';

import { useRouter } from '@tanstack/react-router';

export function useCurrentPathname() {
   const router = useRouter();
   const [pathname, setPathname] = useState(router.state.location.pathname);

   useEffect(() => {
      return router.subscribe('onResolved', () => {
         setPathname(router.state.location.pathname);
      });
   }, [router]);

   return pathname;
}
