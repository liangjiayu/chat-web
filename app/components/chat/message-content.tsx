export function MessageContent({ content }: { content: string }) {
  const codeBlockPattern = /```[\s\S]*?```/g;
  const parts: Array<{ key: string; value: string }> = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockPattern.exec(content))) {
    if (match.index > cursor) {
      parts.push({
        key: `text-${cursor}-${match.index}`,
        value: content.slice(cursor, match.index),
      });
    }

    parts.push({
      key: `code-${match.index}-${codeBlockPattern.lastIndex}`,
      value: match[0],
    });
    cursor = codeBlockPattern.lastIndex;
  }

  if (cursor < content.length) {
    parts.push({
      key: `text-${cursor}-${content.length}`,
      value: content.slice(cursor),
    });
  }

  return parts.map((part) => {
    if (part.value.startsWith('```')) {
      const code = part.value.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/```$/, '');

      return (
        <pre
          className="my-3 overflow-x-auto rounded-lg border border-chat-border-strong bg-chat-surface-muted p-4 text-sm leading-6 text-chat-foreground"
          key={part.key}
        >
          <code>{code}</code>
        </pre>
      );
    }

    return (
      <div className="leading-7 whitespace-pre-wrap" key={part.key}>
        {part.value}
      </div>
    );
  });
}
