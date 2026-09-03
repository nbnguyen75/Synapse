import { createFileRoute, redirect } from '@tanstack/react-router';

// TODO: add marketing, privacy and terms page here
export const Route = createFileRoute('/')({
  beforeLoad: ({ location, context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        search: {
          redirect: location.href,
        },
        to: '/login',
      });
    }
  },
});
