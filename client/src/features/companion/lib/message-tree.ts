import type { FileUIPart, UIMessage } from 'ai';

export interface MessageNode {
  parentId: undefined | string;
  childrenIds: Array<string>;
  role: UIMessage['role'];
  message: UIMessage;
  createdAt: number;
  text: string;
  id: string;
}

export interface ConversationTreeState {
  nodes: Record<string, MessageNode>;
  currentLeafId: undefined | string;
}

export interface TreeMessage extends UIMessage {
  parentId: undefined | string;
}

type TextPart = Extract<UIMessage['parts'][number], { type: 'text' }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getNode(
  nodes: Record<string, MessageNode>,
  id: undefined | string,
): MessageNode | undefined {
  return id ? nodes[id] : undefined;
}

function getMessageCreatedAt(message: UIMessage): number {
  const metadata = message.metadata;

  return isRecord(metadata) && typeof metadata.createdAt === 'number' ? metadata.createdAt : 0;
}

function getRootIds(nodes: Record<string, MessageNode>): Array<string> {
  return Object.values(nodes)
    .filter(({ parentId }) => parentId === undefined)
    .map(({ id }) => id);
}

function getSiblingIds(state: ConversationTreeState, node: MessageNode): Array<string> {
  return node.parentId
    ? (getNode(state.nodes, node.parentId)?.childrenIds ?? [])
    : getRootIds(state.nodes);
}

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is TextPart => part.type === 'text')
    .map(({ text }) => text)
    .join(' ');
}

export function buildTree(
  messages: Array<TreeMessage>,
  currentLeafId: undefined | string,
): ConversationTreeState {
  const nodes: Record<string, MessageNode> = {};

  const ordered = messages.toSorted((a, b) => getMessageCreatedAt(a) - getMessageCreatedAt(b));

  for (const message of ordered) {
    nodes[message.id] = {
      id: message.id,
      role: message.role,
      message,
      parentId: message.parentId,
      childrenIds: [],
      createdAt: getMessageCreatedAt(message),
      text: getMessageText(message),
    };
  }

  for (const message of ordered) {
    const parent = getNode(nodes, message.parentId);

    if (parent) {
      parent.childrenIds.push(message.id);
    }
  }

  return {
    nodes,
    currentLeafId: currentLeafId ?? ordered.at(-1)?.id,
  };
}

export function getActivePath(
  state: ConversationTreeState,
  leafId: undefined | string = state.currentLeafId,
): Array<MessageNode> {
  const path: Array<MessageNode> = [];
  let current = getNode(state.nodes, leafId);

  while (current) {
    path.push(current);
    current = getNode(state.nodes, current.parentId);
  }

  return path.toReversed();
}

export function getRecentContext(state: ConversationTreeState, limit = 5): Array<UIMessage> {
  return getActivePath(state)
    .slice(-limit)
    .map(({ message }) => message);
}

export function addMessage(
  state: ConversationTreeState,
  message: UIMessage,
  parentId: undefined | string,
): ConversationTreeState {
  const node: MessageNode = {
    id: message.id,
    role: message.role,
    message,
    parentId,
    childrenIds: [],
    createdAt: getMessageCreatedAt(message) || Date.now(),
    text: getMessageText(message),
  };

  const nodes = {
    ...state.nodes,
    [message.id]: node,
  };

  const parent = getNode(nodes, parentId);

  if (parent) {
    nodes[parent.id] = {
      ...parent,
      childrenIds: [...parent.childrenIds, node.id],
    };
  }

  return {
    nodes,
    currentLeafId: message.id,
  };
}

export function retryAssistantMessage(
  state: ConversationTreeState,
  assistantMessageId: string,
): {
  userPromptId: undefined | string;
  state: ConversationTreeState;
} {
  const assistant = getNode(state.nodes, assistantMessageId);

  if (!assistant || assistant.role !== 'assistant') {
    return {
      state,
      userPromptId: undefined,
    };
  }

  return {
    state: {
      ...state,
      currentLeafId: assistant.parentId,
    },
    userPromptId: assistant.parentId,
  };
}

export function editUserMessage(
  state: ConversationTreeState,
  userMessageId: string,
  newText: string,
): {
  editedMessage: UIMessage | undefined;
  state: ConversationTreeState;
} {
  const target = getNode(state.nodes, userMessageId);

  if (!target || target.role !== 'user') {
    return {
      editedMessage: undefined,
      state,
    };
  }

  const fileParts = target.message.parts.filter((part): part is FileUIPart => part.type === 'file');

  const editedMessage: UIMessage = {
    id: `msg_${crypto.randomUUID()}`,
    role: 'user',
    metadata: {
      ...(isRecord(target.message.metadata) ? target.message.metadata : {}),
      createdAt: Date.now(),
    },
    parts: [
      ...fileParts,
      {
        type: 'text',
        text: newText,
      },
    ],
  };

  return {
    editedMessage,
    state: addMessage(state, editedMessage, target.parentId),
  };
}

export function switchVersion(
  state: ConversationTreeState,
  targetMessageId: string,
): ConversationTreeState {
  let current = getNode(state.nodes, targetMessageId);

  if (!current) {
    return state;
  }

  while (current.childrenIds.length > 0) {
    const child = getNode(state.nodes, current.childrenIds[0]);

    if (!child) {
      break;
    }

    current = child;
  }

  return current.id === state.currentLeafId
    ? state
    : {
        ...state,
        currentLeafId: current.id,
      };
}

export interface VersionInfo {
  siblings: Array<string>;
  current: number;
  total: number;
}

export function getVersionInfo(
  state: ConversationTreeState,
  messageId: string,
): VersionInfo | undefined {
  const node = getNode(state.nodes, messageId);

  if (!node) {
    return undefined;
  }

  const siblings = getSiblingIds(state, node);

  const sameRoleSiblings = siblings.filter((id) => getNode(state.nodes, id)?.role === node.role);

  if (sameRoleSiblings.length < 2) {
    return undefined;
  }

  const current = sameRoleSiblings.indexOf(messageId);

  if (current === -1) {
    return undefined;
  }

  return {
    siblings: sameRoleSiblings,
    current,
    total: sameRoleSiblings.length,
  };
}
