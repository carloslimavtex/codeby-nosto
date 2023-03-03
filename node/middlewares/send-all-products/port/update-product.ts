import Products from '../../../clients/products';
import Product from '../../../clients/products/product';
import { Product as PortProduct, SendAllProductsPort } from '../use-case';

export default function generateUpdateProduct(products: Products): SendAllProductsPort['updateProduct'] {
  return async (_productId: string, lastScan: number, portProduct: PortProduct) => {
    const product = portProduct as Product;
    product.lastScan = lastScan;
    await products.updateIfHasChanges(product.id, product.dataToUpdate);
  };
}
