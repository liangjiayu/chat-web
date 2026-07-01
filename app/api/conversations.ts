import { request } from '~/lib/request';
import type {
  Conversation,
  ConversationListResponse,
  ConversationMessagesResponse,
} from '~/types/chat';

export function getConversations() {
  return request<ConversationListResponse>({
    method: 'GET',
    url: '/api/conversations',
  });
}

export function getConversationMessages(conversationId: string) {
  return request<ConversationMessagesResponse>({
    method: 'GET',
    url: `/api/conversations/${conversationId}/messages`,
  });
}

export function createConversation(payload: { title: string; model?: string }) {
  return request<{ conversation: Conversation }>({
    method: 'POST',
    url: '/api/conversations',
    data: payload,
  });
}

export function renameConversation(conversationId: string, title: string) {
  return request<{ conversation: Conversation }>({
    method: 'PATCH',
    url: `/api/conversations/${conversationId}`,
    data: { title },
  });
}

export function deleteConversation(conversationId: string) {
  return request<{ ok: boolean }>({
    method: 'DELETE',
    url: `/api/conversations/${conversationId}`,
  });
}
