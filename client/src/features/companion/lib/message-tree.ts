import type { FileUIPart, UIMessage } from 'ai';

export interface MessageNode {
  parentId: string | null;
  role: UIMessage['role'];
  childrenIds: string[];
  message: UIMessage;
  createdAt: number;
  text: string;
  id: string;
}

export interface ConversationTreeState {
  nodes: Record<string, MessageNode>;
  currentLeafId: string | null;
}

export interface TreeMessage extends UIMessage {
  parentId: string | null;
}

type TextPart = Extract<UIMessage['parts'][number], { type: 'text' }>;

function getMessageCreatedAt(message: UIMessage): number {
  const metadata = message.metadata as { createdAt?: number } | undefined;
  return metadata?.createdAt ?? 0;
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is TextPart => part.type === 'text')
    .map((part) => part.text)
    .join(' ');
}

export function buildTree(
  messages: TreeMessage[],
  currentLeafId: string | null,
): ConversationTreeState {
  const nodes: Record<string, MessageNode> = {};
  const childrenById = new Map<string, string[]>();

  const ordered = [...messages].sort((a, b) => getMessageCreatedAt(a) - getMessageCreatedAt(b));

  for (const message of ordered) {
    const parentId = message.parentId ?? null;
    nodes[message.id] = {
      createdAt: getMessageCreatedAt(message),
      text: getMessageText(message),
      role: message.role,
      childrenIds: [],
      id: message.id,
      parentId,
      message,
    };

    if (parentId) {
      const siblings = childrenById.get(parentId) ?? [];
      siblings.push(message.id);
      childrenById.set(parentId, siblings);
    }
  }

  for (const [parentId, childrenIds] of childrenById) {
    const parent = nodes[parentId];
    if (parent) {
      nodes[parentId] = { ...parent, childrenIds };
    }
  }

  const effectiveLeafId =
    currentLeafId && nodes[currentLeafId] ? currentLeafId : (ordered.at(-1)?.id ?? null);

  return { currentLeafId: effectiveLeafId, nodes };
}

export function getActivePath(
  state: ConversationTreeState,
  leafId: string | null = state.currentLeafId,
): MessageNode[] {
  const path: MessageNode[] = [];
  let current = leafId ? state.nodes[leafId] : undefined;

  while (current) {
    path.push(current);
    current = current.parentId ? state.nodes[current.parentId] : undefined;
  }

  return path.reverse();
}

export function getRecentContext(state: ConversationTreeState, limit = 5): UIMessage[] {
  return getActivePath(state)
    .slice(-limit)
    .map((node) => node.message);
}

export function addMessage(
  state: ConversationTreeState,
  message: UIMessage,
  parentId: string | null,
): ConversationTreeState {
  const node: MessageNode = {
    createdAt: getMessageCreatedAt(message) || Date.now(),
    text: getMessageText(message),
    role: message.role,
    childrenIds: [],
    id: message.id,
    parentId,
    message,
  };

  const nodes = { ...state.nodes, [message.id]: node };

  if (parentId && nodes[parentId]) {
    const parent = nodes[parentId];
    nodes[parentId] = {
      ...parent,
      childrenIds: [...parent.childrenIds, node.id],
    };
  }

  return { currentLeafId: message.id, nodes };
}

export function retryAssistantMessage(
  state: ConversationTreeState,
  assistantMessageId: string,
): { state: ConversationTreeState; userPromptId: string | null } {
  const assistant = state.nodes[assistantMessageId];
  if (!assistant || assistant.role !== 'assistant') {
    return { userPromptId: null, state };
  }

  return {
    state: { ...state, currentLeafId: assistant.parentId },
    userPromptId: assistant.parentId,
  };
}

export function editUserMessage(
  state: ConversationTreeState,
  userMessageId: string,
  newText: string,
): { editedMessage: UIMessage | null; state: ConversationTreeState } {
  const target = state.nodes[userMessageId];
  if (!target || target.role !== 'user') {
    return { editedMessage: null, state };
  }

  const fileParts = target.message.parts.filter((part): part is FileUIPart => part.type === 'file');

  const editedMessage: UIMessage = {
    metadata: {
      ...(target.message.metadata as Record<string, unknown> | undefined),
      createdAt: Date.now(),
    },
    parts: [...fileParts, { text: newText, type: 'text' }],
    id: `msg_${crypto.randomUUID()}`,
    role: 'user',
  };

  return {
    state: addMessage(state, editedMessage, target.parentId),
    editedMessage,
  };
}

export function switchVersion(
  state: ConversationTreeState,
  targetMessageId: string,
): ConversationTreeState {
  if (!state.nodes[targetMessageId]) {
    return state;
  }

  let leafId = targetMessageId;
  while (state.nodes[leafId]?.childrenIds.length > 0) {
    leafId = state.nodes[leafId].childrenIds[0];
  }

  if (leafId === state.currentLeafId) {
    return state;
  }

  return { ...state, currentLeafId: leafId };
}

export interface VersionInfo {
  siblings: string[];
  current: number;
  total: number;
}

export function getVersionInfo(
  state: ConversationTreeState,
  messageId: string,
): VersionInfo | null {
  const node = state.nodes[messageId];
  if (!node) return null;

  const siblings = node.parentId
    ? (state.nodes[node.parentId]?.childrenIds ?? [])
    : Object.values(state.nodes)
        .filter((candidate) => candidate.parentId === null)
        .map((candidate) => candidate.id);

  const sameRoleSiblings = siblings.filter((id) => state.nodes[id]?.role === node.role);
  if (sameRoleSiblings.length < 2) return null;

  const current = sameRoleSiblings.indexOf(messageId);
  if (current === -1) return null;

  return {
    total: sameRoleSiblings.length,
    siblings: sameRoleSiblings,
    current,
  };
}
