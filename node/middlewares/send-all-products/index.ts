import { SendAllProductsData } from '../../utils/events';
import { SendAllProductsUseCase } from './use-case';
import sendAllProductsPort from './port';

export default async function sendAllProductsMiddleware(ctx: Context, next: () => Promise<void>) {
  await sendAllProductsMiddlewareExecution(ctx);
  await next();
}

export async function sendAllProductsMiddlewareExecution(ctx: Context) {
  const {
    clients: { catalog, events, products, nostoEvents },
  } = ctx;

  const { page, lastScan } = ctx.body as SendAllProductsData;

  const port = sendAllProductsPort({
    lastScan,
    page,
    catalog,
    events,
    products,
    nostoEvents,
  });
  const useCase = new SendAllProductsUseCase(port);
  await useCase.execute();

  return {
    port,
    useCase,
  };
}
