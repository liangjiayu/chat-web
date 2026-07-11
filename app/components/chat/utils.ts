import type { Conversation } from '@/types/api.generated';

type ConversationGroup = {
  label: string;
  items: Conversation[];
};

export function groupConversations(conversations: Conversation[]) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
  });

  return conversations.reduce<ConversationGroup[]>((groups, conversation) => {
    const label = formatter.format(new Date(conversation.updated_at)).replace('/', '-');
    const group = groups.find((item) => item.label === label);

    if (group) {
      group.items.push(conversation);
    } else {
      groups.push({ label, items: [conversation] });
    }

    return groups;
  }, []);
}

export function sortConversationsByUpdatedAt(conversations: Conversation[]) {
  return conversations.reduce<Conversation[]>((items, conversation) => {
    const updatedAt = new Date(conversation.updated_at).getTime();
    const index = items.findIndex((item) => new Date(item.updated_at).getTime() < updatedAt);

    if (index === -1) {
      return [...items, conversation];
    }

    return [...items.slice(0, index), conversation, ...items.slice(index)];
  }, []);
}
