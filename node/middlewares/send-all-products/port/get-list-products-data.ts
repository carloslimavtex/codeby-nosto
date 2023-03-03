import Catalog from '../../../clients/catalog';
import { SendAllProductsPort } from '../use-case';

export default function generateGetListProductsData(
  catalog: Catalog,
  page: number
): SendAllProductsPort['getListProductsData'] {
  return async () => {
    const list = await catalog.listProducts(page);

    const productIds = Object.keys(list.data);

    return {
      productIds,
      hasMore: list.range.total > list.range.to,
    };
  };
}
