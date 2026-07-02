import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyChatProps = {
  composer: ReactNode;
};

export function EmptyChat({ composer }: EmptyChatProps) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mb-7 flex items-center gap-3 text-center">
        <Sparkles className="h-8 w-8 shrink-0 text-[#3566ff]" />
        <h2 className="text-xl font-semibold md:text-2xl">使用快速模式开始对话</h2>
      </div>
      <div className="w-full max-w-3xl">{composer}</div>
    </div>
  );
}
