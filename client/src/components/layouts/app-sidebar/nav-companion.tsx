import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useGetConversationsQuery } from '@/features/companion/hooks/use-companion-conversation';
import { ConversationListItem } from '@/features/companion/components/conversation-list-item';

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
} from 'lucide-react';

export default function NavCompanion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setRightSidebarOpen, setLayoutMode, layoutMode } = useSettingsStore();
  const activeConversationId = useCompanionStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  const { data: conversations = [], isLoading } = useGetConversationsQuery();

  const favoriteConversations = conversations.filter(
    (conversation) => conversation.favorited,
  );

  const recentConversations = conversations.filter(
    (conversation) => !conversation.favorited,
  );

  const handleNewChat = () => {
    setActiveConversationId(null);
    if (layoutMode === 'chat') {
      navigate({ to: '/chat' });
    } else {
      setRightSidebarOpen(true);
    }
  };

  const handleLayoutModeChange = (checked: boolean) => {
    setLayoutMode(checked ? 'chat' : 'agent');
    if (checked) {
      const hasMessages =
        (activeConversationId != null &&
          conversations.some(
            (conversation) => conversation.id === activeConversationId,
          )) ||
        (activeConversationId != null &&
          (queryClient
            .getQueryData<{
              pages: { length: number }[];
            }>(['companion-conversation-messages', activeConversationId])
            ?.pages.some((page) => page.length > 0) ??
            false));

      if (activeConversationId && hasMessages) {
        navigate({
          params: { conversationId: activeConversationId },
          to: '/chat/$conversationId',
        });
      } else {
        setActiveConversationId(null);
        navigate({ to: '/chat' });
      }
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    if (layoutMode === 'chat') {
      navigate({ to: '/chat/$conversationId', params: { conversationId } });
    } else {
      setRightSidebarOpen(true);
    }
  };

  const handleConversationDeleted = (conversationId: string) => {
    if (conversationId === activeConversationId) {
      setActiveConversationId(null);
    }
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
                  {layoutMode === 'agent' ? (
                    <BotIcon className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <MessageSquareIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}

                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {layoutMode === 'agent'
                        ? m.sidebar_mode_agent()
                        : m.sidebar_mode_chat()}
                    </span>
                  </div>
                </div>

                <Switch
                  checked={layoutMode === 'chat'}
                  onCheckedChange={handleLayoutModeChange}
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

      <SidebarGroupLabel>{m.sidebar_favorites()}</SidebarGroupLabel>
      <SidebarMenu>
        {favoriteConversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            {m.chat_conversation_favorites_empty()}
          </p>
        ) : (
          favoriteConversations.map((conversation) => (
            <ConversationListItem
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              key={conversation.id}
              onDeleted={handleConversationDeleted}
              onSelect={handleSelectConversation}
            />
          ))
        )}
      </SidebarMenu>

      <SidebarGroupLabel>{m.sidebar_recents()}</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <Skeleton className="h-8 w-full" />
            </SidebarMenuItem>
          ))
        ) : recentConversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            {m.chat_conversations_empty()}
          </p>
        ) : (
          recentConversations.map((conversation) => (
            <ConversationListItem
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              key={conversation.id}
              onDeleted={handleConversationDeleted}
              onSelect={handleSelectConversation}
            />
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
