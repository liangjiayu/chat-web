import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),
  route('chat', 'routes/chat.tsx', { id: 'chat' }, [
    index('routes/chat-index.tsx', { id: 'chat-index' }),
    route(':id', 'routes/chat-detail.tsx', { id: 'chat-detail' }),
  ]),
  route('*', 'routes/not-found.tsx', { id: 'not-found' }),
] satisfies RouteConfig;
