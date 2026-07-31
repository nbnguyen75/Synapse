import { m } from '@/paraglide/messages';
import { useSession } from '@/lib/auth';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
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
                {user?.name?.charAt(0)?.toUpperCase() ||
                  m.profile_page_fallback_avatar()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {user?.name || m.profile_page_fallback_name()}
              </CardTitle>
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
