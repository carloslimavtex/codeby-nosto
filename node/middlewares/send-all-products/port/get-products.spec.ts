import { IOContext } from '@vtex/api';
import Products from '../../../clients/products';
import Product from '../../../clients/products/product';
import generateGetProduct from './get-product';

jest.mock('@vtex/api');
jest.mock('../../../clients/products');

function createProducts() {
  const products = new Products(null as unknown as IOContext);

  return products;
}

describe('generateGetProduct', () => {
  it('should be a function', () => {
    expect(typeof generateGetProduct).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateGetProduct(createProducts())).toBe('function');
  });

  it('should call getOrCreateProduct', async () => {
    const returnObject = {} as Record<string, string>;
    const products = createProducts();
    jest.spyOn(products, 'getOrCreateProduct').mockImplementation((id: string) => {
      returnObject.id = id;
      return Promise.resolve(returnObject as unknown as Product);
    });

    const getProduct = generateGetProduct(products);
    const response = await getProduct('1');
    expect(returnObject.id).toBe('1');
    expect(response).toBe(returnObject);
  });
});
