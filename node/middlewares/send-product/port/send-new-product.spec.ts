import type { IOContext } from '@vtex/api';
import Nosto from '../../../clients/nosto';
import { PortNostoData } from '../use-case';
import nostoDataToNostoProduct from './nosto-data-to-nosto-product';
import generateSendNewProduct from './send-new-product';

jest.mock('../../../clients/nosto');
jest.mock('./nosto-data-to-nosto-product');

function createNosto() {
  return new Nosto({} as IOContext);
}

function createData() {
  return {} as PortNostoData;
}

describe('generateSendNewProduct', () => {
  it('should be a function', () => {
    expect(typeof generateSendNewProduct).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateSendNewProduct(createNosto())).toBe('function');
  });

  it('should call nostoDataToNostoProduct with product', async () => {
    const nosto = createNosto();
    const data = createData();
    const sendNewProduct = generateSendNewProduct(nosto);

    await sendNewProduct(data);

    expect(nostoDataToNostoProduct).toHaveBeenCalledWith(data);
  });

  it('should call nosto.createProduct with nosto product', async () => {
    const nosto = createNosto();
    const data = createData();
    const otherData = {};
    const sendNewProduct = generateSendNewProduct(nosto);
    (nostoDataToNostoProduct as jest.Mock).mockImplementation(() => otherData);

    await sendNewProduct(data);

    expect(nosto.createProduct).toHaveBeenCalledWith(otherData);
  });
});
