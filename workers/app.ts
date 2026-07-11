import { Hono } from 'hono';
import { createRequestHandler } from 'react-router';

import { chatRoute } from './modules/chat/route';
import { conversationsRoute } from './modules/conversations/route';
import { jsonError } from './shared/response';

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.route('/api', conversationsRoute);
app.route('/api', chatRoute);

app.onError((error) => {
  if (error instanceof SyntaxError) {
    return jsonError('请求体不是合法 JSON');
  }

  return jsonError('服务器内部错误', 500);
});

app.get('*', (c) => {
  const requestHandler = createRequestHandler(
    () => import('virtual:react-router/server-build'),
    import.meta.env.MODE,
  );

  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
