import type { ReactNode } from 'react';

type EmptyChatProps = {
  composer: ReactNode;
};

export function EmptyChat({ composer }: EmptyChatProps) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <h2 className="mb-8 text-center text-[32px] leading-tight text-chat-foreground-strong">
        今天想聊点什么？
      </h2>
      <div className="w-full max-w-[680px]">{composer}</div>
    </div>
  );
}
