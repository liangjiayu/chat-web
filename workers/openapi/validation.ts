import type { Context } from 'hono';
import type { ZodError } from 'zod';

export function validationHook(result: { success: boolean; error?: ZodError }, c: Context) {
  if (!result.success) {
    return c.json(
      {
        error: result.error?.issues[0]?.message ?? '请求参数不合法',
        code: 400,
      },
      400,
    );
  }
}
