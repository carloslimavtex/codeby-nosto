import { SendProductData } from '../../utils/events';
import { SendProductUseCase } from './use-case';
import sendProductPort from './port';

export default async function sendProductMiddleware(ctx: Context, next: () => Promise<void>) {
  await sendProductMiddlewareExecution(ctx);

  await next();
}

export async function sendProductMiddlewareExecution(ctx: Context) {
  const {
    clients: { catalog, nosto },
  } = ctx;

  const { productId } = ctx.body as SendProductData;

  const port = sendProductPort({ productId, catalog, nosto });
  const useCase = new SendProductUseCase(port);
  await useCase.execute();
}
