import { Check, Loader2, Search, Send, Sparkles } from 'lucide-react';

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
        <div className="pointer-events-auto mb-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="pointer-events-auto rounded-3xl border border-border bg-background p-3 shadow-[0_12px_40px_rgb(15_23_42_/_0.12)]">
        <Textarea
          className="max-h-40 min-h-14 resize-none border-0 px-2 shadow-none focus-visible:ring-0"
          disabled={isSending}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="给 DeepSeek 发送消息"
          value={input}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" type="button" variant="secondary">
              <Sparkles className="h-4 w-4" />
              深度思考
            </Button>
            <Button size="sm" type="button" variant="outline">
              <Search className="h-4 w-4" />
              智能搜索
            </Button>
          </div>
          <Button
            className="rounded-full bg-[#6d86ff] text-white hover:bg-[#5f78f0]"
            disabled={!input.trim() || isSending}
            onClick={onSend}
            size="icon"
            title="发送"
            type="button"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5" />
        <span>内容由 AI 生成，请仔细甄别</span>
      </div>
    </>
  );
}
