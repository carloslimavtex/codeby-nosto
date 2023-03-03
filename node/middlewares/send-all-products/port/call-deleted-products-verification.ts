import { EventSender, verifyAllProductsInVtex } from '../../../utils/events';
import { SendAllProductsPort } from '../use-case';

// eslint-disable-next-line max-len
export default function generateCallDeletedProductsVerification(
  eventSender: EventSender,
  lastScan: number
): SendAllProductsPort['callDeletedProductsVerification'] {
  return async () => {
    const date = new Date();
    // to avoid vtex cache not updating fast enough
    date.setMinutes(date.getMinutes() + 1);

    await eventSender({
      eventArgs: verifyAllProductsInVtex(lastScan),
      nextCall: date,
      emitEvent: false,
    });
  };
}
