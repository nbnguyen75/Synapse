import type { AuthContext } from '@/types';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { ThemeProvider } from '@/components/providers/theme-providers';

import { Toaster } from '@/components/ui/sonner';

import { useSession } from '@/core/client/auth-client';
// Import the generated route tree
import { routeTree } from '@/routeTree.gen';

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
   const { data: session } = useSession();

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
