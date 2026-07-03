import type { Conversation, ConversationRow, Message, MessageRow, Metadata } from '../types';

export function makeTitle(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 28 ? `${normalized.slice(0, 28)}...` : normalized || '新对话';
}

export function parseMetadata(value: string | null): Metadata {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Metadata)
      : {};
  } catch {
    return {};
  }
}

export function toConversation(row: ConversationRow): Conversation {
  return {
    ...row,
    metadata: parseMetadata(row.metadata),
  };
}

export function toMessage(row: MessageRow): Message {
  return {
    ...row,
    metadata: parseMetadata(row.metadata),
  };
}
