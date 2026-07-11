import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

import { chatRoute } from './modules/chat/route';
import { conversationsRoute } from './modules/conversations/route';
import { openApiConfig } from './openapi/config';
import { validationHook } from './openapi/validation';

export const api = new OpenAPIHono<{ Bindings: Cloudflare.Env }>({
  defaultHook: validationHook,
});

api.route('/', conversationsRoute);
api.route('/', chatRoute);
api.doc('/openapi.json', openApiConfig);
api.get('/docs', swaggerUI({ url: '/api/openapi.json' }));
