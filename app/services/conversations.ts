import type {
  ConversationListResponse,
  ConversationMessagesResponse,
  ConversationResponse,
  DeleteConversationResponse,
  EditMessageResponse,
} from '@contracts/conversations';

import { request } from '@/lib/request';

export function getConversations() {
  return request<ConversationListResponse>({
    method: 'GET',
    url: '/api/conversations',
  });
}

export function getConversationMessages(conversationId: string) {
  return request<ConversationMessagesResponse>({
    method: 'GET',
    url: `/api/conversations/${conversationId}`,
  });
}

export function renameConversation(conversationId: string, title: string) {
  return request<ConversationResponse>({
    method: 'PATCH',
    url: `/api/conversations/${conversationId}`,
    data: { title },
  });
}

export function deleteConversation(conversationId: string) {
  return request<DeleteConversationResponse>({
    method: 'DELETE',
    url: `/api/conversations/${conversationId}`,
  });
}

export function editMessage(conversationId: string, messageId: string, content: string) {
  return request<EditMessageResponse>({
    method: 'PATCH',
    url: `/api/conversations/${conversationId}/messages/${messageId}`,
    data: { content },
  });
}
