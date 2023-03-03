import { IOContext } from '@vtex/api';
import Catalog from '../../../clients/catalog';
import generateGetListProductsData from './get-list-products-data';

jest.mock('../../../clients/catalog');
jest.mock('@vtex/api');

type GenerateCatalogParams = {
  productIds?: string[];
  addToTotal?: number;
};
function createCatalog(params: GenerateCatalogParams = {}) {
  const { productIds = [], addToTotal = 0 } = params;
  const catalog = new Catalog(null as unknown as IOContext);
  jest.spyOn(catalog, 'listProducts').mockImplementation((page = 1) => {
    const data = productIds.reduce((acc, id) => {
      acc[id] = [1, 2, 3];
      return acc;
    }, {} as Record<string, number[]>);

    const count = productIds.length;
    const from = (page - 1) * count + 1;
    const to = page * count;
    const total = to + addToTotal;

    return Promise.resolve({
      data,
      range: {
        from,
        to,
        total,
      },
    });
  });

  return catalog;
}

describe('generateListProductsData', () => {
  it('should be a function', () => {
    expect(typeof generateGetListProductsData).toBe('function');
  });

  it('should return another function', () => {
    expect(typeof generateGetListProductsData(createCatalog(), 1)).toBe('function');
  });

  describe('returned function', () => {
    it('should return productIds', () => {
      const productIds = ['1', '2'];
      const getListProductsData = generateGetListProductsData(createCatalog({ productIds }), 1);

      return expect(getListProductsData()).resolves.toEqual(
        expect.objectContaining({
          productIds,
        })
      );
    });

    it('should have hasMore as true', () => {
      const productIds = ['1', '2', '3'];
      const getListProductsData = generateGetListProductsData(createCatalog({ productIds, addToTotal: 1 }), 1);

      return expect(getListProductsData()).resolves.toEqual({
        productIds,
        hasMore: true,
      });
    });

    it('should have hasMore as false', () => {
      const productIds = ['1', '2', '4'];
      const getListProductsData = generateGetListProductsData(createCatalog({ productIds, addToTotal: 0 }), 1);

      return expect(getListProductsData()).resolves.toEqual({
        productIds,
        hasMore: false,
      });
    });
  });
});
