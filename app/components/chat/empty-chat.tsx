import { Code2, Coffee, GraduationCap, Pencil, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';

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
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <PromptPill icon={<Code2 className="h-4 w-4" />} label="代码" />
        <PromptPill icon={<Coffee className="h-4 w-4" />} label="生活" />
        <PromptPill icon={<GraduationCap className="h-4 w-4" />} label="学习" />
        <PromptPill icon={<Pencil className="h-4 w-4" />} label="写作" />
        <PromptPill icon={<Sparkles className="h-4 w-4" />} label="智能推荐" />
      </div>
    </div>
  );
}

function PromptPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Button
      className="h-8 gap-1.5 rounded-lg border-chat-border-strong bg-chat-background px-2.5 text-sm font-semibold text-chat-foreground shadow-sm hover:bg-chat-hover"
      type="button"
      variant="outline"
    >
      <span className="text-chat-foreground-muted">{icon}</span>
      {label}
    </Button>
  );
}
