import type { Conversation, Message } from './models';

export type CreateConversationRequest = {
  title?: string;
  model?: string;
};

export type CreateConversationResponse = {
  conversation: Conversation;
};

export type RenameConversationRequest = {
  title?: string;
};

export type ConversationListResponse = Conversation[];

export type ConversationResponse = Conversation;

export type ConversationMessagesResponse = {
  conversation: Conversation;
  messages: Message[];
};

export type DeleteConversationResponse = {
  success: true;
};
