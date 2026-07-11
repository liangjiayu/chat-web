import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createRequestHandler } from 'react-router';

import { api } from './api';
import { jsonError } from './shared/response';

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.route('/api', api);

app.onError((error) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

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
