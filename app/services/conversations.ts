import type {
  ConversationListResponse,
  ConversationMessagesResponse,
  ConversationResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationResponse,
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

export function createConversation(payload: CreateConversationRequest) {
  return request<CreateConversationResponse>({
    method: 'POST',
    url: '/api/conversations',
    data: payload,
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
