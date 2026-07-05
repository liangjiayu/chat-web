import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

type MarkdownRendererProps = {
  content: string;
};

const markdownComponents: Components = {
  a({ className, ...props }) {
    return (
      <a
        className={cn('text-chat-accent underline underline-offset-4', className)}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      />
    );
  },
  blockquote({ className, ...props }) {
    return (
      <blockquote
        className={cn(
          'my-3 border-l-4 border-chat-border-strong pl-4 text-chat-foreground-muted',
          className,
        )}
        {...props}
      />
    );
  },
  code({ className, ...props }) {
    return (
      <code
        className={cn(
          'rounded bg-chat-surface-muted px-1 py-0.5 font-mono text-[0.9em]',
          className,
        )}
        {...props}
      />
    );
  },
  h1({ className, ...props }) {
    return (
      <h1
        className={cn('mt-5 mb-3 text-2xl leading-8 font-semibold first:mt-0', className)}
        {...props}
      />
    );
  },
  h2({ className, ...props }) {
    return (
      <h2
        className={cn('mt-5 mb-3 text-xl leading-8 font-semibold first:mt-0', className)}
        {...props}
      />
    );
  },
  h3({ className, ...props }) {
    return (
      <h3
        className={cn('mt-4 mb-2 text-lg leading-7 font-semibold first:mt-0', className)}
        {...props}
      />
    );
  },
  hr({ className, ...props }) {
    return <hr className={cn('my-5 border-chat-border-strong', className)} {...props} />;
  },
  li({ className, ...props }) {
    return <li className={cn('pl-1 leading-7', className)} {...props} />;
  },
  ol({ className, ...props }) {
    return (
      <ol className={cn('my-3 list-decimal space-y-1 pl-6 last:mb-0', className)} {...props} />
    );
  },
  p({ className, ...props }) {
    return (
      <p
        className={cn('my-3 leading-7 whitespace-pre-wrap first:mt-0 last:mb-0', className)}
        {...props}
      />
    );
  },
  pre({ className, ...props }) {
    return (
      <pre
        className={cn(
          'my-3 overflow-x-auto rounded-lg border border-chat-border-strong bg-chat-surface-muted p-4 text-sm leading-6 text-chat-foreground [&_code]:bg-transparent [&_code]:p-0',
          className,
        )}
        {...props}
      />
    );
  },
  table({ className, ...props }) {
    return (
      <div className="my-4 overflow-x-auto">
        <table className={cn('w-full border-collapse text-left text-sm', className)} {...props} />
      </div>
    );
  },
  td({ className, ...props }) {
    return (
      <td
        className={cn('border border-chat-border-strong px-3 py-2 align-top', className)}
        {...props}
      />
    );
  },
  th({ className, ...props }) {
    return (
      <th
        className={cn(
          'border border-chat-border-strong bg-chat-surface-muted px-3 py-2 font-semibold',
          className,
        )}
        {...props}
      />
    );
  },
  ul({ className, ...props }) {
    return <ul className={cn('my-3 list-disc space-y-1 pl-6 last:mb-0', className)} {...props} />;
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
