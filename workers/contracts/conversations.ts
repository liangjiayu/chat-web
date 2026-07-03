import type { ConversationDTO, MessageDTO } from './models';

export type CreateConversationRequest = {
  title?: string;
  model?: string;
};

export type RenameConversationRequest = {
  title?: string;
};

export type ConversationListResponse = {
  conversations: ConversationDTO[];
};

export type ConversationResponse = {
  conversation: ConversationDTO;
};

export type ConversationMessagesResponse = {
  conversation: ConversationDTO;
  messages: MessageDTO[];
};

export type DeleteConversationResponse = {
  ok: true;
};
