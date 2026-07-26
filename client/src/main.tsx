import type { AuthContext } from '@/types/shared';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';

import { ThemeProvider } from '@/providers/theme-provider';

import { useSession } from '@/lib/auth-client';

import { LoadingScreen } from '@/components/common/loading-screen';

import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
         retry: 3,
      },
   },
});

// Create a new router instance
const router = createRouter({
   context: {
      auth: undefined!,
      queryClient,
   },
   routeTree,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
   interface Register {
      router: typeof router;
   }
}

function InnerApp() {
   const { data: session, isPending } = useSession();

   if (isPending) {
      return <LoadingScreen />;
   }

   const auth: AuthContext = session
      ? { isAuthenticated: true, user: session.user }
      : { isAuthenticated: false, user: null };

   return <RouterProvider router={router} context={{ queryClient, auth }} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
   const root = ReactDOM.createRoot(rootElement);

   root.render(
      <StrictMode>
         <ThemeProvider defaultTheme="system" storageKey="synapse-app-theme">
            <QueryClientProvider client={queryClient}>
               <InnerApp />

               <Toaster
                  richColors
                  theme="light"
                  closeButton
                  position="top-center"
               />
            </QueryClientProvider>
         </ThemeProvider>
      </StrictMode>,
   );
}
