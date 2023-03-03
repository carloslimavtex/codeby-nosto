import { sendProduct, VerifyProductInVtexData, productsCurrentTime } from '../../utils/events';
import { consoleInfo } from '../../utils/console';

export const MAX_WAIT_TIME_IN_SECONDS = 60 * 60 * 2;

export default async function verifyUpdateOfProductMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { catalog, products, eventSender },
  } = ctx;

  const { productId } = ctx.body as VerifyProductInVtexData;

  const product = await products.getOrCreateProduct(productId);

  // already updated by other event
  if (!product.isWaitingIndex) {
    return await next();
  }

  let timestamp = await catalog.getProductIndexedTimestamp(productId);
  timestamp = updateTimestampIfIsTooOld(product.waitingIndexSince, timestamp || 0);
  // no timestamp(product was never indexed) or index didn't update
  if (!timestamp || !product.shouldUpdateLastUpdate(timestamp)) {
    return await next();
  }

  consoleInfo(
    'verifyUpdateOfProduct middleware. Updating product',
    product.id,
    'to lastUpdate at',
    timestamp,
    'and sending sendProduct'
  );
  product.lastUpdate = timestamp;
  await products.updateIfHasChanges(product.id, product.dataToUpdate);
  // await events.sendEvent(...sendProduct(productId));
  await eventSender({ eventArgs: sendProduct(productId) });

  await next();
}

function updateTimestampIfIsTooOld(waitingIndexSince: number, timestamp: number): number {
  const maximumWaitingTime = waitingIndexSince + MAX_WAIT_TIME_IN_SECONDS;
  const now = productsCurrentTime();
  return maximumWaitingTime < now ? now : timestamp;
}
