import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AuthLayout } from '@/layouts/auth/auth-layout';

export const Route = createFileRoute('/_auth')({
   beforeLoad: ({ context }) => {
      if (context.auth.isAuthenticated) {
         throw redirect({ to: '/notes' });
      }
   },
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <AuthLayout>
         <Outlet />
      </AuthLayout>
   );
}
