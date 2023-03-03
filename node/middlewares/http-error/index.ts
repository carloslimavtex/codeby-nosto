import { consoleWarn } from '../../utils/console';

export default async function httpErrorMiddleware(_ctx: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (err) {
    if (!err.response) {
      throw err;
    }

    consoleWarn(
      'HTTP ERROR!',
      JSON.stringify({
        requestPath: err.request?.path,
        status: err.response.status,
        data: err.response.data,
      })
    );
  }
}
