import { Events } from '@vtex/api';
import Catalog from '../../../clients/catalog';
import NostoEvents from '../../../clients/nosto-events';
import Products from '../../../clients/products';
import { generateEventSender } from '../../../utils/events/event-sender';
import { SendAllProductsPort } from '../use-case';
import generateCallDeletedProductsVerification from './call-deleted-products-verification';
import generateCallNextPage from './call-next-page';
import generateGetListProductsData from './get-list-products-data';
import generateGetProduct from './get-product';
import generateSendProduct from './send-product';
import generateUpdateProduct from './update-product';

export type PortParams = {
  lastScan: number;
  page: number;
  catalog: Catalog;
  events: Events;
  products: Products;
  nostoEvents: NostoEvents;
};
export default function sendAllProductsPort({
  lastScan,
  page,
  catalog,
  products,
  events,
  nostoEvents,
}: PortParams): SendAllProductsPort {
  const eventSender = generateEventSender(events, nostoEvents);

  return {
    lastScan,
    getListProductsData: generateGetListProductsData(catalog, page),
    callDeletedProductsVerification: generateCallDeletedProductsVerification(eventSender, lastScan),
    callNextPage: generateCallNextPage(eventSender, page, lastScan),
    getProduct: generateGetProduct(products),
    sendProduct: generateSendProduct(eventSender),
    updateProduct: generateUpdateProduct(products),
  };
}
