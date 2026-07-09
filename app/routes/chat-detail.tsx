import { useParams } from 'react-router';

import { ChatComposer, ChatHeader, MessageList } from '@/components/chat';
import { useMessagesQuery } from '@/queries/conversations';

export function meta() {
  return [{ title: 'Chatty' }, { name: 'description', content: 'Chatty conversation workspace' }];
}

export default function ChatDetail() {
  const { id } = useParams();
  const messagesQuery = useMessagesQuery(id ?? null);
  const conversation = messagesQuery.data?.conversation ?? null;
  const messages = messagesQuery.data?.messages ?? [];

  return (
    <>
      <ChatHeader title={conversation?.title} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col pt-6">
          <div className="flex-1 px-4">
            <MessageList conversation={conversation} messages={messages} />
          </div>
          <div className="pointer-events-none sticky bottom-0 z-10 bg-chat-main-background px-4 pt-4 pb-3">
            <ChatComposer />
            <p className="pointer-events-auto mt-3 text-center text-xs text-chat-foreground-muted">
              Chatty 可能会出错，请核对重要信息。
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
