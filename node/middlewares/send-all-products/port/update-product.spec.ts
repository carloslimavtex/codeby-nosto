import { IOContext } from '@vtex/api';
import Products from '../../../clients/products';
import { Product } from '../use-case';
import generateUpdateProduct from './update-product';

jest.mock('../../../clients/products');

function createProducts() {
  const products = new Products(null as unknown as IOContext);

  return products;
}

type UpdateParam = {
  productLastScan: number;
  lastScan: number;
  productId: string;
  dataToUpdate: unknown;
};
async function update({ productLastScan, lastScan, productId, dataToUpdate }: UpdateParam) {
  const product: Product & Record<string, unknown> = {
    id: productId,
    lastScan: productLastScan,
    dataToUpdate,
  };
  const products = createProducts();
  const updateProduct = generateUpdateProduct(products);
  await updateProduct(productId, lastScan, product);
  return {
    products,
    product,
    productId,
    lastScan,
    productLastScan,
  };
}

describe('generateUpdateProduct', () => {
  it('should be a function', () => {
    expect(typeof generateUpdateProduct).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateUpdateProduct(createProducts())).toBe('function');
  });

  it('should update lastScan', async () => {
    const { product, lastScan, productLastScan } = await update({
      productLastScan: 1,
      lastScan: 2,
      productId: '3',
      dataToUpdate: null,
    });
    expect(product.lastScan).toBe(lastScan);
    expect(product.lastScan).not.toBe(productLastScan);
  });

  it('should call updateIfHasChanges', async () => {
    const { products } = await update({ productLastScan: 1, lastScan: 2, productId: '3', dataToUpdate: null });
    expect(products.updateIfHasChanges).toHaveBeenCalled();
  });

  it('should send id and dataToUpdate', async () => {
    const dataToUpdate = { test: 1 };
    const { products, productId } = await update({
      productLastScan: 1,
      lastScan: 2,
      productId: '3',
      dataToUpdate,
    });
    expect(products.updateIfHasChanges).toHaveBeenCalledWith(productId, dataToUpdate);
  });
});
