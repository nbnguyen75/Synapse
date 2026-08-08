import { useNavigate } from '@tanstack/react-router';

import { useGetConversationsQuery } from '@/features/companion';

import { useCompanionStore } from '@/store/companion-store';
import { useSettingsStore } from '@/store/settings-store';

import { m } from '@/paraglide/messages';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import {
  BotIcon,
  MessageCirclePlusIcon,
  MessageSquareIcon,
  MessageSquareTextIcon,
} from 'lucide-react';

export default function NavCompanion() {
  const navigate = useNavigate();
  const { setLayoutMode, layoutMode } = useSettingsStore();
  const activeConversationId = useCompanionStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  const { data: conversations = [], isLoading } = useGetConversationsQuery();

  const handleNewChat = () => {
    setActiveConversationId(null);
    void navigate({ to: '/chat' });
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    void navigate({ to: '/chat' });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{m.sidebar_ai_companion()}</SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="w-full"
            render={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {layoutMode === 'servant' ? (
                    <BotIcon className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <MessageSquareIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}

                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {layoutMode === 'servant'
                        ? m.sidebar_mode_servant()
                        : m.sidebar_mode_chat()}
                    </span>
                  </div>
                </div>

                <Switch
                  checked={layoutMode === 'chat'}
                  onCheckedChange={(checked) =>
                    setLayoutMode(checked ? 'chat' : 'servant')
                  }
                />
              </div>
            }
          />
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton className="w-full" onClick={handleNewChat}>
            <MessageCirclePlusIcon className="size-4" />
            <span>{m.sidebar_new_chat()}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupLabel>{m.sidebar_recents()}</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <Skeleton className="h-8 w-full" />
            </SidebarMenuItem>
          ))
        ) : conversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            {m.chat_conversations_empty()}
          </p>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            return (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <MessageSquareTextIcon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-left text-sm">
                    {conversation.title ?? m.chat_conversation_untitled()}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })
        )}
      </SidebarMenu>

      <SidebarGroupLabel>{m.sidebar_favorites()}</SidebarGroupLabel>
      <SidebarMenu>
        <p className="px-3 py-2 text-sm text-muted-foreground">
          {m.chat_conversations_empty()}
        </p>
      </SidebarMenu>
    </SidebarGroup>
  );
}
