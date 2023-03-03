import Products from '../../../clients/products';
import { SendAllProductsPort } from '../use-case';

export default function generateGetProduct(products: Products): SendAllProductsPort['getProduct'] {
  return async (productId: string) => {
    return products.getOrCreateProduct(productId);
  };
}
