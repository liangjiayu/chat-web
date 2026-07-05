import { Outlet } from 'react-router';

import { ChatLayout, ConversationDialogs, ConversationSidebar } from '@/components/chat';

export function meta() {
  return [{ title: 'Chatty' }, { name: 'description', content: 'Chatty conversation workspace' }];
}

export default function Chat() {
  return (
    <>
      <ChatLayout sidebar={<ConversationSidebar />}>
        <Outlet />
      </ChatLayout>
      <ConversationDialogs />
    </>
  );
}
