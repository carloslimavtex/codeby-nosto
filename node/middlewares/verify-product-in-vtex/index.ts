import { VerifyProductInVtexData } from '../../utils/events';
import { consoleInfo } from '../../utils/console';

export default async function verifyProductInVtexMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { catalog, nosto, products },
  } = ctx;

  const { productId } = ctx.body as VerifyProductInVtexData;

  const product = await catalog.getProduct(productId);

  if (!product) {
    consoleInfo('verifyProductInVtex middleware. Deleting product', productId);
    await nosto.deleteProduct(productId);
    await products.deleteProduct(productId);
  }

  await next();
}
