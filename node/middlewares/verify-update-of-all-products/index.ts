import { verifyUpdateOfAllProducts, verifyUpdateOfProduct } from '../../utils/events';
import type { VerifyUpdateOfAllProductsData } from '../../utils/events';
import { consoleInfo } from '../../utils/console';

export default async function verifyUpdateOfAllProductsMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { products, eventSender },
  } = ctx;

  const { token } = ctx.body as VerifyUpdateOfAllProductsData;

  const [mdToken, productIds] = await products.getMissingUpdateProductIds(token);

  consoleInfo(
    'verifyUpdateOfAllProducts middleware products.getMissingUpdateProductIds(token) => productIds:',
    JSON.stringify([productIds])
  );

  if (productIds.length) {
    // await Promise.all(productIds.map((productId) => events.sendEvent(...verifyUpdateOfProduct(productId))));
    // await events.sendEvent(...verifyUpdateOfAllProducts(mdToken));
    await Promise.all(productIds.map((productId) => eventSender({ eventArgs: verifyUpdateOfProduct(productId) })));
    await eventSender({ eventArgs: verifyUpdateOfAllProducts(mdToken) });
    consoleInfo('verifyUpdateOfAllProducts middleware. Sending again for next page');
  }

  await next();
}
