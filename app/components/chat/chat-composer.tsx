import { AudioLines, ChevronDown, Loader2, Mic, Plus, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type ChatComposerProps = {
  error: string | null;
  input: string;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
};

export function ChatComposer({
  error,
  input,
  isSending,
  onInputChange,
  onSend,
}: ChatComposerProps) {
  return (
    <>
      {error ? (
        <div className="pointer-events-auto mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="pointer-events-auto rounded-[24px] border border-[#dedede] bg-white p-3 shadow-[0_18px_44px_rgb(47_43_37_/_0.1)]">
        <Textarea
          className="max-h-40 min-h-14 resize-none border-0 bg-transparent px-3 py-2 text-[17px] text-[#34302a] shadow-none placeholder:text-[#77716a] focus-visible:ring-0 md:text-[20px]"
          disabled={isSending}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="给 Chatty 发送消息..."
          value={input}
        />
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              className="size-9 rounded-lg text-[#34302a] hover:bg-[#f1efea]"
              size="icon"
              title="添加"
              type="button"
              variant="ghost"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              className="h-8 gap-1 rounded-lg px-2 text-sm font-semibold text-[#34302a] hover:bg-[#f1efea]"
              type="button"
              variant="ghost"
            >
              deepseek-v4-flash
              <ChevronDown className="h-3.5 w-3.5 text-[#7b756d]" />
            </Button>
            <Button
              className="size-9 rounded-lg text-[#34302a] hover:bg-[#f1efea]"
              size="icon"
              title="语音输入"
              type="button"
              variant="ghost"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              className="size-9 rounded-lg text-[#34302a] hover:bg-[#f1efea]"
              size="icon"
              title="语音模式"
              type="button"
              variant="ghost"
            >
              <AudioLines className="h-4 w-4" />
            </Button>
            <Button
              className="size-9 rounded-lg bg-[#2f2b25] text-white hover:bg-[#47413a]"
              disabled={!input.trim() || isSending}
              onClick={onSend}
              size="icon"
              title="发送"
              type="button"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-[#8b857d]">内容由 AI 生成，请仔细甄别</div>
    </>
  );
}
