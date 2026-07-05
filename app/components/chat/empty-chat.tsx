import type { ReactNode } from 'react';

import { AppLogo } from '@/components/app-logo';

type EmptyChatProps = {
  composer: ReactNode;
};

export function EmptyChat({ composer }: EmptyChatProps) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-8 flex items-center gap-4 text-center">
        <AppLogo className="h-10 w-10" />
        <h2 className="font-serif text-[34px] leading-tight font-semibold text-chat-foreground-strong md:text-[44px]">
          使用快速模式开始对话
        </h2>
      </div>
      <div className="w-full max-w-[680px]">{composer}</div>
    </div>
  );
}
