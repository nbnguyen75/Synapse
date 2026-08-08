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

  const handleNewChat = () => {
    setActiveConversationId(null);
    setRightSidebarOpen(true);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setRightSidebarOpen(true);
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
        ) : conversations.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            {m.chat_conversations_empty()}
          </p>
        ) : (
          conversations.map((conversation) => (
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
