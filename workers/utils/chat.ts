export function makeTitle(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 28 ? `${normalized.slice(0, 28)}...` : normalized || '新对话';
}
