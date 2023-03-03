import { sendProduct, EventSender } from '../../../utils/events';
import { SendAllProductsPort } from '../use-case';

export default function generateSendProduct(eventSender: EventSender): SendAllProductsPort['sendProduct'] {
  return async (productId: string) => {
    eventSender({
      eventArgs: sendProduct(productId),
    });
  };
}
