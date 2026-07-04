import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),
  route('chat', 'routes/chat.tsx', { id: 'chat' }),
  route('chat/:id', 'routes/chat-detail.tsx', { id: 'chat-detail' }),
] satisfies RouteConfig;
