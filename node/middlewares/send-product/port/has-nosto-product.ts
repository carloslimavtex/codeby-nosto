import Nosto from '../../../clients/nosto';
import { SendProductPort } from '../use-case';

export default function generateHasNostoProduct(nosto: Nosto, productId: string): SendProductPort['hasNostoProduct'] {
  return () => nosto.hasProduct(productId);
}
