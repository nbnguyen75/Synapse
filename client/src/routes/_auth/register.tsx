import { createFileRoute } from '@tanstack/react-router';

import RegisterPage, {
   head as registerHead,
} from '@/features/auth/components/register-page';

export const Route = createFileRoute('/_auth/register')({
   component: RegisterPage,
   head: registerHead,
});
