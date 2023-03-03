import Catalog from '../../../clients/catalog';
import { PortVtexProduct, SendProductPort } from '../use-case';

export default function generateGetVtexProduct(catalog: Catalog, productId: string): SendProductPort['getVtexProduct'] {
  return () => catalog.getProduct(productId) as Promise<PortVtexProduct>;
}
