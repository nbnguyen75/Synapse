import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/shared/types';

import {
   createRootRouteWithContext,
   HeadContent,
   Outlet,
   useNavigate,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import { CommandPalette } from '@/shared/components/command-palette';

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
   const navigate = useNavigate();

   return (
      <>
         <HeadContent />
         <Outlet />

         <CommandPalette
            onNewNote={() => navigate({ to: '/notes' })}
            onFocusSearch={() => navigate({ to: '/notes' })}
         />

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
