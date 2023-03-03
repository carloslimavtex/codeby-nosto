import type { IOContext } from '@vtex/api';
import { generateProductData } from '../../../../react/store/product-page/utils';
import Nosto from '../../../clients/nosto';
import { PortVtexProduct } from '../use-case';
import generateVtexProductToNostoData from './vtex-product-to-nosto-data';

jest.mock('../../../clients/nosto');
jest.mock('../../../../react/store/product-page/utils');

function createNosto() {
  return new Nosto({} as IOContext);
}

function createProduct() {
  return {} as PortVtexProduct;
}

describe('generateVtexProductToNostoData', () => {
  it('should be a function', () => {
    expect(typeof generateVtexProductToNostoData).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateVtexProductToNostoData(createNosto()));
  });

  it('should call generateProductData', () => {
    const vtexProductToNostoData = generateVtexProductToNostoData(createNosto());
    vtexProductToNostoData(createProduct());
    expect(generateProductData).toHaveBeenCalled();
  });

  it('should use nosto data and product', () => {
    const nosto = createNosto();
    nosto.currency = 'currency';
    nosto.domain = 'foo.com.br';
    nosto.targetWorkspace = 'my-workspace';
    const product = createProduct();

    const vtexProductToNostoData = generateVtexProductToNostoData(nosto);
    vtexProductToNostoData(product);

    expect(generateProductData).toHaveBeenCalledWith(product, {
      currency: nosto.currency,
      host: nosto.domain,
      workspace: nosto.targetWorkspace,
    });
  });
});
