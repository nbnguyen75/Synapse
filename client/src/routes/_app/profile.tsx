import { createFileRoute } from '@tanstack/react-router';

import { createTitle } from '@/shared/lib/metadata';

import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/shared/components/ui/card';
import {
   Avatar,
   AvatarFallback,
   AvatarImage,
} from '@/shared/components/ui/avatar';

import { Mail, Calendar } from 'lucide-react';

import { useSession } from '@/core/auth/auth-client';
import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/profile')({
   head: () => ({
      meta: [{ title: createTitle(m.profile_page_title()) }],
   }),
   component: RouteComponent,
});

function RouteComponent() {
   const { data: session } = useSession();
   const user = session?.user;

   return (
      <div className="mx-auto max-w-lg p-6">
         <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">
               {m.profile_page_title()}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
               {m.profile_page_description()}
            </p>
         </div>

         <Card>
            <CardHeader>
               <div className="flex items-center gap-4">
                  <Avatar size="lg">
                     {user?.image && <AvatarImage src={user.image} />}
                     <AvatarFallback className="text-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                     </AvatarFallback>
                  </Avatar>
                  <div>
                     <CardTitle>{user?.name || 'User'}</CardTitle>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{user?.email || ''}</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>{m.profile_page_joined_recently()}</span>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
