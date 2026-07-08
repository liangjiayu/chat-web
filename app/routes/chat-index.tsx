import { ChatComposer, EmptyChat } from '@/components/chat';

export default function ChatIndex() {
  const composer = <ChatComposer />;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 pt-[25vh] pb-10 md:px-6">
        <EmptyChat composer={composer} />
      </div>
    </div>
  );
}
