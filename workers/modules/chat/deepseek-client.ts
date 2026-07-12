import { DEEPSEEK_CHAT_COMPLETIONS_URL } from '../../constants';

function makeTitleMessages(prompt: string) {
  return [
    {
      role: 'system',
      content:
        '你是聊天应用的会话命名助手。请根据用户第一条消息概括会话主题，不要回复用户。输出一个简短标题，优先使用名词短语或动宾短语，并尽量匹配用户使用的语言。',
    },
    {
      role: 'user',
      content: `请为这条用户消息生成会话标题：${prompt}`,
    },
  ];
}

function parseTitleContent(content: string) {
  const title = content
    .replace(/```(?:\w+)?/g, '')
    .replace(/^["'“”‘’]+|["'“”‘’。！？!?：:]+$/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  return title || null;
}

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
