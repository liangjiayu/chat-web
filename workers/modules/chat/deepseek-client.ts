import { DEEPSEEK_CHAT_COMPLETIONS_URL } from '../../constants';
import { makeTitleMessages, parseTitleContent } from './title';

export async function generateConversationTitle(input: {
  apiKey: string;
  model: string;
  prompt: string;
}) {
  const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      messages: makeTitleMessages(input.prompt),
      stream: false,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return parseTitleContent(data.choices?.[0]?.message?.content ?? '');
}

export function requestChatCompletion(input: {
  apiKey: string;
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}) {
  return fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      stream: true,
    }),
  });
}
