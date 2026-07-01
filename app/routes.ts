import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),
  route('chat', 'routes/home.tsx', { id: 'chat' }),
  route('chat/:id', 'routes/home.tsx', { id: 'chat-detail' }),
] satisfies RouteConfig;
