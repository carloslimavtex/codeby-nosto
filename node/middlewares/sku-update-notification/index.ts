import { productsCurrentTime } from '../../utils/events';
import { consoleInfo } from '../../utils/console';

export default async function skuUpdateNotificationMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { products, catalogGraphQL },
    body: { IdSku, DateModified },
  } = ctx;

  const response = await catalogGraphQL.sku(IdSku);
  if (!response) {
    return await next();
  }

  const productId = response.sku.productId;
  const timestamp = productsCurrentTime(new Date(DateModified));

  consoleInfo('skuUpdateNotificationMiddleware products.productNotified', JSON.stringify({ productId, timestamp }));

  const product = await products.getOrCreateProduct(productId);
  product.lastNotification = timestamp;
  products.updateIfHasChanges(product.id, product.dataToUpdate);

  await next();
}
