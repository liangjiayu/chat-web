import { useParams } from 'react-router';

import { ChatComposer, ChatHeader, MessageList } from '@/components/chat';
import { cn } from '@/lib/utils';
import { useMessagesQuery } from '@/queries/conversations';
import { useChatStore } from '@/stores';

export function meta() {
  return [{ title: 'Chatty' }, { name: 'description', content: 'Chatty conversation workspace' }];
}

export default function ChatDetail() {
  const { id } = useParams();
  const messagesQuery = useMessagesQuery(id ?? null);
  const sidebarOpen = useChatStore((state) => state.sidebarOpen);
  const conversation = messagesQuery.data?.conversation ?? null;
  const messages = messagesQuery.data?.messages ?? [];

  return (
    <>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-4 pt-7 pb-52 md:px-6">
          <MessageList conversation={conversation} messages={messages} />
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-linear-to-t from-[#fbfbfa] via-[#fbfbfa] to-[#fbfbfa]/0 pt-12',
          sidebarOpen ? 'md:left-[286px]' : 'md:left-16',
        )}
      >
        <div className="mx-auto max-w-[800px] px-4 pb-3 md:px-6">
          <ChatComposer />
        </div>
      </div>
    </>
  );
}
