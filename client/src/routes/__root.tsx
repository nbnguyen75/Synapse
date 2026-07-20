import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/types';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { env } from '@/env';

interface RouterContext {
   queryClient: QueryClient;
   auth: AuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
   head: () => ({
      meta: [
         {
            charSet: 'utf-8',
         },
         {
            content: 'width=device-width, initial-scale=1',
            name: 'viewport',
         },
         {
            title: `${env.VITE_APP_NAME}`,
         },
      ],
   }),
   component: RootLayout,
});

function RootLayout() {
   return (
      <>
         <Outlet />
         <TanStackRouterDevtools initialIsOpen={false} />
      </>
   );
}
