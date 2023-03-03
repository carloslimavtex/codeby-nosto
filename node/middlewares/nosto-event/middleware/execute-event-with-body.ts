import { NostoEventPort } from '../use-case';

export default function generateExecuteEventWithBody(
  ctx: Context,
  next: () => Promise<void>
): NostoEventPort['executeEventWithBody'] {
  return async function executeEventWithBody(data) {
    const body = ctx.body;
    ctx.body = data;
    try {
      await next();
    } finally {
      ctx.body = body;
    }
  };
}
