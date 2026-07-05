import type { ReactNode } from 'react';

type EmptyChatProps = {
  composer: ReactNode;
};

export function EmptyChat({ composer }: EmptyChatProps) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-[34px] leading-tight font-semibold text-chat-foreground-strong md:text-[44px]">
          今天想聊点什么？
        </h2>
      </div>
      <div className="w-full max-w-[680px]">{composer}</div>
    </div>
  );
}
