import { createFileRoute } from '@tanstack/react-router';

import LoginPage, {
   head as loginHead,
} from '@/features/auth/components/login-page';

export const Route = createFileRoute('/_auth/login')({
   component: LoginPage,
   head: loginHead,
});
