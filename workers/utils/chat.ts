export function makeTitle() {
  return '新对话';
}

export function makeTitleMessages(prompt: string) {
  return [
    {
      role: 'system',
      content:
        '你是聊天应用的会话命名助手。你的任务是根据用户第一条消息概括会话主题，不是回复用户。输出一个简短中文标题，优先使用名词短语或动宾短语。要求：2到12个字；不要标点、引号、emoji、日期、寒暄回复、解释或Markdown。用户只是问候时，返回“初次问候”。',
    },
    {
      role: 'user',
      content: `请为这条用户消息生成会话标题：${prompt}`,
    },
  ];
}

export function parseTitleContent(content: string) {
  const title = content
    .replace(/```(?:\w+)?/g, '')
    .replace(/^["'“”‘’]+|["'“”‘’。！？!?：:]+$/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  return title || null;
}
