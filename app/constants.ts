export const DEFAULT_CONVERSATION_TITLE = '新对话';
export const DEFAULT_CHAT_MODEL = 'deepseek-v4-flash';

export const MESSAGE_ROLE = {
  ASSISTANT: 'assistant',
  USER: 'user',
} as const;

export const MESSAGE_STATUS = {
  DONE: 'done',
  STREAMING: 'streaming',
} as const;

export const CHAT_STREAM_EVENT = {
  DONE: 'done',
  ERROR: 'error',
  MESSAGE: 'message',
  TITLE: 'title',
} as const;
