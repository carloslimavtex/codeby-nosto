import Nosto from '../../../clients/nosto';
import { SendProductPort } from '../use-case';
import nostoDataToNostoProduct from './nosto-data-to-nosto-product';

export default function generateSendUpdateProduct(nosto: Nosto): SendProductPort['sendUpdateProduct'] {
  return (nostoData) => nosto.updateProduct(nostoDataToNostoProduct(nostoData));
}
