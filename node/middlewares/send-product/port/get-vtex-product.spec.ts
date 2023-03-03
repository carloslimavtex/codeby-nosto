import type { IOContext } from '@vtex/api';
import Catalog from '../../../clients/catalog';
import generateGetVtexProduct from './get-vtex-product';

jest.mock('../../../clients/catalog');

function createCatalog() {
  return new Catalog({} as unknown as IOContext);
}

describe('generateGetVtexProduct', () => {
  it('should be a function', () => {
    expect(typeof generateGetVtexProduct).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateGetVtexProduct(createCatalog(), '1')).toBe('function');
  });

  it('should call getProduct', async () => {
    const catalog = createCatalog();
    const productId = '123';
    const getVtexProduct = generateGetVtexProduct(catalog, productId);
    await getVtexProduct();
    expect(catalog.getProduct).toHaveBeenCalledWith(productId);
  });
});
