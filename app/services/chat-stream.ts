import { CHAT_STREAM_EVENT } from '@/constants';
import type { ChatRequest } from '@/types/api-generated';
import type { ChatStreamEvent } from '@/types/chat-stream';

function parseSseBlock(block: string): ChatStreamEvent | null {
  let event: string = CHAT_STREAM_EVENT.MESSAGE;
  let data = '';

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    }

    if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  }

  if (!data) {
    return null;
  }

  return { event, data: JSON.parse(data) } as ChatStreamEvent;
}

export async function* streamChat(payload: ChatRequest): AsyncGenerator<ChatStreamEvent> {
  const response = await fetch('/api/chat/completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error || '发送失败');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const event = parseSseBlock(block);

      if (event) {
        yield event;
      }
    }
  }
}
