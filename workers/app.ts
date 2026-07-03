import { Hono } from 'hono';
import { createRequestHandler } from 'react-router';

import { chatRoute } from './routes/chat';
import { conversationsRoute } from './routes/conversations';

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.route('/api', conversationsRoute);
app.route('/api', chatRoute);

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
