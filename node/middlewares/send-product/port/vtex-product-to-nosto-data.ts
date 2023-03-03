import { generateProductData } from '../../../../react/store/product-page/utils';
import Nosto from '../../../clients/nosto';
import { SendProductPort } from '../use-case';

export default function generateVtexProductToNostoData(nosto: Nosto): SendProductPort['vtexProductToNostoData'] {
  return (product) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    generateProductData(product as any, {
      currency: nosto.currency,
      host: nosto.domain,
      workspace: nosto.targetWorkspace,
    });
}
