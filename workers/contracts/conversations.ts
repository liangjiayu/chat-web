import type { ConversationDTO, MessageDTO } from './models';

export type CreateConversationRequest = {
  title?: string;
  model?: string;
};

export type RenameConversationRequest = {
  title?: string;
};

export type ConversationListResponse = ConversationDTO[];

export type ConversationResponse = ConversationDTO;

export type ConversationMessagesResponse = {
  conversation: ConversationDTO;
  messages: MessageDTO[];
};

export type DeleteConversationResponse = {
  success: true;
};
