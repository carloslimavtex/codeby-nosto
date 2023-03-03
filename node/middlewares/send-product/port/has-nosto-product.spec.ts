import type { IOContext } from '@vtex/api';
import Nosto from '../../../clients/nosto';
import generateHasNostoProduct from './has-nosto-product';

jest.mock('../../../clients/nosto');

function createNosto() {
  return new Nosto({} as IOContext);
}

describe('generateHasNostoProduct', () => {
  it('should be a function', () => {
    expect(typeof generateHasNostoProduct).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateHasNostoProduct(createNosto(), '123'));
  });

  it('should call hasProduct', async () => {
    const nosto = createNosto();
    const productId = '123';
    const hasNostoProduct = generateHasNostoProduct(nosto, productId);

    await hasNostoProduct();
    expect(nosto.hasProduct).toHaveBeenCalledWith(productId);
  });
});
