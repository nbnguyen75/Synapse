import type { CompanionConversation } from '@/features/companion/types/companion';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';

import {
  useDeleteConversationMutation,
  useRenameConversationMutation,
  useToggleConversationFavoriteMutation,
} from '@/features/companion/hooks/use-companion-conversation';
import { renameConversationSchema } from '@/features/companion/schemas';

import { useFormSaveShortcut } from '@/hooks/use-form-save-shortcut';
import { useIsMobile } from '@/hooks/use-mobile';

import { useConfirm } from '@/providers/confirm-provider';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
  MoreHorizontalIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';

interface ConversationListItemProps {
  conversation: CompanionConversation;
  onDeleted: (id: string) => void;
  onSelect: (id: string) => void;
  isActive: boolean;
}

export function ConversationListItem({
  conversation,
  onDeleted,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  const isMobile = useIsMobile();
  const confirm = useConfirm();
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const { mutate: renameConversation } = useRenameConversationMutation();
  const { mutate: deleteConversation } = useDeleteConversationMutation();
  const { mutate: toggleFavorite } = useToggleConversationFavoriteMutation();

  const form = useForm<{ title: string }>({
    resolver: standardSchemaResolver(renameConversationSchema),
    defaultValues: { title: conversation.title ?? '' },
  });

  const handleRenameOpenChange = (open: boolean) => {
    if (open) {
      form.reset({ title: conversation.title ?? '' });
    }
    setIsRenameOpen(open);
  };

  const handleRenameSubmit = ({ title }: { title: string }) => {
    renameConversation({
      params: { id: conversation.id },
      body: { title },
    });
    setIsRenameOpen(false);
  };

  useFormSaveShortcut({
    isSubmitting: form.formState.isSubmitting,
    onSubmit: handleRenameSubmit,
    enabled: isRenameOpen,
    form,
  });

  const handleDeleteConfirm = () => {
    deleteConversation(
      { params: { id: conversation.id } },
      { onSuccess: () => onDeleted(conversation.id) },
    );
  };

  const handleDeleteClick = async () => {
    const confirmed = await confirm({
      description: m.chat_conversation_delete_description(),
      confirmText: m.chat_conversation_delete_confirm(),
      cancelText: m.chat_conversation_rename_cancel(),
      title: m.chat_conversation_delete_title(),
      variant: 'destructive',
    });
    if (confirmed) {
      handleDeleteConfirm();
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      body: { favorited: !conversation.favorited },
      params: { id: conversation.id },
    });
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => onSelect(conversation.id)}
      >
        <span className="min-w-0 flex-1 truncate text-left text-sm">
          {conversation.title ?? m.chat_conversation_untitled()}
        </span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              aria-label={m.chat_conversation_action_menu()}
              showOnHover
            >
              <MoreHorizontalIcon className="size-4" />
            </SidebarMenuAction>
          }
        />

        <DropdownMenuContent
          side={isMobile ? 'bottom' : 'right'}
          className="w-52"
        >
          <DropdownMenuItem onClick={handleToggleFavorite}>
            <StarIcon
              className={
                conversation.favorited
                  ? 'size-4 text-amber-400'
                  : 'size-4 text-muted-foreground'
              }
            />
            {conversation.favorited
              ? m.chat_conversation_action_unstar()
              : m.chat_conversation_action_star()}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
            <PencilIcon className="size-4 text-muted-foreground" />
            {m.chat_conversation_action_rename()}
          </DropdownMenuItem>

          <DropdownMenuItem variant="destructive" onClick={handleDeleteClick}>
            <Trash2Icon className="size-4" />
            {m.chat_conversation_action_delete()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={handleRenameOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.chat_conversation_rename_title()}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleRenameSubmit)}
          >
            <Field>
              <FieldLabel htmlFor="conversation-title">
                {m.chat_conversation_action_rename()}
              </FieldLabel>
              <Input
                autoFocus
                id="conversation-title"
                placeholder={m.chat_conversation_rename_placeholder()}
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <FieldError>{form.formState.errors.title.message}</FieldError>
              )}
            </Field>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setIsRenameOpen(false)}
                variant="ghost"
              >
                {m.chat_conversation_rename_cancel()}
              </Button>
              <Button
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
                type="submit"
              >
                {m.chat_conversation_rename_save()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarMenuItem>
  );
}
