import type { MessageMetadata } from '@/database/schema';
import type { UIMessage } from 'ai';

import { randomUUID } from 'node:crypto';

import { createIdGenerator } from 'ai';

import {
  createNewConversation,
  createConversationWithId,
  findAllConversationByUserId,
  findConversationById,
  findMessageById,
  findMessagesByConversationId,
  findMessagesByConversationIdPage,
  insertMessage,
  insertMessagesBulk,
  deletePermanentConversation,
  updateCurrentMessage,
  updateFavoriteConversation,
  updateConversationTitle,
} from '@/conversation/repository';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

type MessageRow = Awaited<ReturnType<typeof findMessagesByConversationId>>[number];

function extractPlainTextFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return '';
  return parts
    .filter(
      (p: unknown): p is { text: string; type: 'text' } =>
        typeof p === 'object' &&
        p !== null &&
        'type' in p &&
        p.type === 'text' &&
        'text' in p &&
        typeof p.text === 'string',
    )
    .map((p) => p.text.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

function toUIMessage(r: MessageRow): { parentId: string | null } & UIMessage {
  return {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Drizzle jsonb is unknown; trust DB shape here
    parts: r.parts as UIMessage['parts'],
    metadata: r.metadata ?? undefined,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- roleEnum includes data/tool; chat path only stores user/assistant/system
    role: r.role as UIMessage['role'],
    parentId: r.parentId,
    id: r.id,
  };
}

export async function getOrCreateConversation(userId: string, conversationId?: string) {
  if (!conversationId) {
    return createNewConversation(userId);
  }

  return checkConversationOwnership(userId, conversationId);
}

export async function checkConversationOwnership(userId: string, conversationId: string) {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new NotFoundError('Cuộc trò chuyện không tồn tại');
  }
  if (conversation.userId !== userId) {
    throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện này');
  }

  return conversation;
}

export async function listConversations(userId: string) {
  return findAllConversationByUserId(userId);
}

export async function renameConversation(userId: string, conversationId: string, title: string) {
  await checkConversationOwnership(userId, conversationId);
  await updateConversationTitle(conversationId, title);
}

export async function deleteConversation(userId: string, conversationId: string) {
  await checkConversationOwnership(userId, conversationId);
  await deletePermanentConversation(conversationId);
}

export async function setConversationFavorite(
  userId: string,
  conversationId: string,
  favorited: boolean,
) {
  await checkConversationOwnership(userId, conversationId);
  await updateFavoriteConversation(conversationId, favorited);
}

export async function loadActivePath(
  conversationId: string,
  upToMessageId: string,
): Promise<Array<UIMessage>> {
  const rows = await findMessagesByConversationId(conversationId);
  const byId = new Map(rows.map((r) => [r.id, r]));

  const path: Array<MessageRow> = [];
  let current = byId.get(upToMessageId);
  while (current) {
    path.push(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path
    .toReversed()
    .map((r) => toUIMessage(r))
    .filter((msg) => {
      if (!Array.isArray(msg.parts) || msg.parts.length === 0) return false;
      return true;
    });
}

export async function loadMessagesPage(
  conversationId: string,
  limit: number,
  offset: number,
): Promise<Array<{ parentId: string | null } & UIMessage>> {
  const rows = await findMessagesByConversationIdPage(conversationId, limit, offset);

  return rows.toReversed().map((r) => toUIMessage(r));
}

export async function appendMessage(
  conversationId: string,
  message: UIMessage,
  parentId?: string | null,
) {
  await insertMessage(conversationId, {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- UIMessage metadata is unknown at the boundary
    metadata: (message.metadata ?? null) as MessageMetadata | null,
    searchText: extractPlainTextFromParts(message.parts) || null,
    parentId: parentId ?? null,
    parts: message.parts,
    role: message.role,
    id: message.id,
  });
  await updateCurrentMessage(conversationId, message.id);
}

export async function setConversationCurrentMessage(
  userId: string,
  conversationId: string,
  messageId: string,
) {
  await checkConversationOwnership(userId, conversationId);

  const message = await findMessageById(messageId);
  if (message?.conversationId !== conversationId) {
    throw new NotFoundError('Tin nhắn không tồn tại trong cuộc trò chuyện này');
  }

  await updateCurrentMessage(conversationId, messageId);
}

export async function cloneConversation(
  userId: string,
  conversationId: string,
  upToMessageId?: string,
) {
  const conversation = await checkConversationOwnership(userId, conversationId);
  const rows = await findMessagesByConversationId(conversationId);

  let keptRows = rows;
  if (upToMessageId) {
    const boundaryIndex = rows.findIndex((row) => row.id === upToMessageId);
    if (boundaryIndex === -1) {
      throw new NotFoundError('Tin nhắn không tồn tại trong cuộc trò chuyện này');
    }
    keptRows = rows.slice(0, boundaryIndex + 1);
  }

  const newConversationId = randomUUID();
  const generateId = createIdGenerator({ prefix: 'msg', size: 16 });
  const idMap = new Map<string, string>();
  const newRows = keptRows.map((row) => {
    const newId = generateId();
    idMap.set(row.id, newId);
    return {
      parentId: row.parentId ? (idMap.get(row.parentId) ?? null) : null,
      searchText: row.searchText,
      createdAt: row.createdAt,
      metadata: row.metadata,
      parts: row.parts,
      role: row.role,
      id: newId,
    };
  });

  const lastKeptId = keptRows.at(-1)?.id;
  const newCurrentMessageId = lastKeptId ? (idMap.get(lastKeptId) ?? null) : null;

  await createConversationWithId({
    title: conversation.title,
    id: newConversationId,
    userId,
  });

  await insertMessagesBulk(newConversationId, newRows);

  if (newCurrentMessageId) {
    await updateCurrentMessage(newConversationId, newCurrentMessageId);
  }

  return findConversationById(newConversationId);
}
