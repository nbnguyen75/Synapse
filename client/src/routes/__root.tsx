import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/types';

import {
   createRootRouteWithContext,
   HeadContent,
   Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import appCss from '@/styles.css?url';

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
            title: env.VITE_APP_NAME,
         },
      ],
      links: [
         {
            rel: 'stylesheet',
            href: appCss,
         },
      ],
   }),
   component: RootLayout,
});

function RootLayout() {
   return (
      <>
         <HeadContent />
         <Outlet />

         <TanStackDevtools
            config={{
               hideUntilHover: true,
            }}
            plugins={[
               {
                  render: <ReactQueryDevtoolsPanel />,
                  name: 'TanStack Query',
               },
               {
                  render: <TanStackRouterDevtoolsPanel />,
                  name: 'TanStack Router',
               },
            ]}
         />
      </>
   );
}
