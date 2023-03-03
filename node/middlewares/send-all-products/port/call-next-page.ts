import { EventSender, sendAllProducts } from '../../../utils/events';
import { SendAllProductsPort } from '../use-case';

export default function generateCallNextPage(
  eventSender: EventSender,
  currentPage: number,
  lastScan: number
): SendAllProductsPort['callNextPage'] {
  return async () => {
    await eventSender({
      eventArgs: sendAllProducts(currentPage + 1, lastScan),
      addToNextCall: 5 * 60, // retry after 5 minutes
    });
  };
}
