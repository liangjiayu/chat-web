import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message, code: status }, { status });
}

export function httpError(message: string, status: ContentfulStatusCode): never {
  throw new HTTPException(status, { res: jsonError(message, status) });
}
