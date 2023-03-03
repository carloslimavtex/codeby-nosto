import {
  VerifyAllProductsInVtexData,
  verifyAllProductsInVtex,
  productsCurrentTime,
  verifyProductInVtex,
} from '../../utils/events';
import { TooManyRequestsError } from '@vtex/api';
import sleep from '../../utils/sleep';
import { consoleInfo } from '../../utils/console';

export const WAIT_TIME_SECONDS = 30;

export default async function verifyAllProductsInVtexMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { products, eventSender },
  } = ctx;

  const { lastScan, token } = ctx.body as VerifyAllProductsInVtexData;
  const currentTimestamp = productsCurrentTime();
  // small delay to avoid getting last page products(vtex delay in updating their search/scroll)
  if (currentTimestamp < lastScan + WAIT_TIME_SECONDS) {
    const waitTime = Math.random() * 5_000;
    consoleInfo(
      'verifyAllProductsInVtex middleware. Waiting',
      waitTime,
      'miliseconds and throwing TooManyRequestsError because lastScan',
      lastScan,
      'is too new'
    );
    await sleep(5_000 + Math.ceil(Math.random() * 5_000));
    throw new TooManyRequestsError(`Just waiting ${WAIT_TIME_SECONDS} to masterdata update`);
  }

  const [newToken, productIds] = await products.getDeletedProductIds(lastScan, token);

  if (!productIds.length) {
    return await next();
  }
  // await Promise.all(productIds.map((productId) => events.sendEvent(...verifyProductInVtex(productId))));
  await Promise.all(productIds.map((productId) => eventSender({ eventArgs: verifyProductInVtex(productId) })));

  consoleInfo('verifyAllProductsInVtex middleware. Sending again for next page');
  // await events.sendEvent(...verifyAllProductsInVtex(lastScan, newToken));
  await eventSender({
    eventArgs: verifyAllProductsInVtex(lastScan, newToken),
  });

  await next();
}
