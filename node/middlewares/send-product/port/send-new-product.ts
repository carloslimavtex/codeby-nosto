import Nosto from '../../../clients/nosto';
import { SendProductPort } from '../use-case';
import nostoDataToNostoProduct from './nosto-data-to-nosto-product';

export default function generateSendNewProduct(nosto: Nosto): SendProductPort['sendNewProduct'] {
  return (nostoData) => nosto.createProduct(nostoDataToNostoProduct(nostoData));
}
