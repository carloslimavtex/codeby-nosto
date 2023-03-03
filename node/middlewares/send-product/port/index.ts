import Catalog from '../../../clients/catalog';
import Nosto from '../../../clients/nosto';
import { SendProductPort } from '../use-case';
import generateGetVtexProduct from './get-vtex-product';
import generateHasNostoProduct from './has-nosto-product';
import generateSendNewProduct from './send-new-product';
import generateSendUpdateProduct from './send-update-product';
import generateVtexProductToNostoData from './vtex-product-to-nosto-data';

export type PortParams = {
  productId: string;
  catalog: Catalog;
  nosto: Nosto;
};
export default function sendProductPort({ productId, catalog, nosto }: PortParams): SendProductPort {
  return {
    productId,
    getVtexProduct: generateGetVtexProduct(catalog, productId),
    hasNostoProduct: generateHasNostoProduct(nosto, productId),
    sendNewProduct: generateSendNewProduct(nosto),
    sendUpdateProduct: generateSendUpdateProduct(nosto),
    vtexProductToNostoData: generateVtexProductToNostoData(nosto),
  };
}
