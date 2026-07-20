import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
   // beforeLoad: ({ context, location }) => {
   //    if (!context.auth.isAuthenticated) {
   //       throw redirect({
   //          to: '/login',
   //          search: { redirect: location.href },
   //       })
   //    }
   // },
   component: RouteComponent,
});

function RouteComponent() {
   return <Outlet />;
}
