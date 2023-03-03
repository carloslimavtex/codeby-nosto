import { PortNostoData, PortVtexProduct, SendProductPort, SendProductUseCase } from './use-case';

function emptyPort(): SendProductPort {
  return {
    productId: '1',
    getVtexProduct: jest.fn(defaultGetVtexProduct()),
    hasNostoProduct: jest.fn(defaultHasNostoProduct()),
    sendNewProduct: jest.fn(defaultSendNewProduct()),
    sendUpdateProduct: jest.fn(defaultSendNewProduct()),
    vtexProductToNostoData: jest.fn(defaultVtexProductToNostoData()),
  };
}

function defaultGetVtexProduct(): SendProductPort['getVtexProduct'] {
  return () => Promise.resolve(undefined);
}

function defaultHasNostoProduct(): SendProductPort['hasNostoProduct'] {
  return () => Promise.resolve(false);
}

function defaultSendNewProduct(): SendProductPort['sendNewProduct'] {
  return () => Promise.resolve(true);
}

function defaultVtexProductToNostoData(): SendProductPort['vtexProductToNostoData'] {
  return (data) => ({ productId: 'error', ...data });
}

type CreatePortParams = {
  productId?: string;
  product?: PortVtexProduct;
  hasVtexProduct?: boolean;
  nostoData?: PortNostoData;
  hasNostoProduct?: boolean;
};
function createPort(args: CreatePortParams = {}): SendProductPort {
  const { productId = '1', product, hasVtexProduct, nostoData, hasNostoProduct = false } = args;

  const port = emptyPort();
  if (product) {
    jest.spyOn(port, 'getVtexProduct').mockImplementation(() => Promise.resolve(product));
  } else if (hasVtexProduct) {
    jest.spyOn(port, 'getVtexProduct').mockImplementation(() => Promise.resolve({ productId }));
  }

  if (nostoData) {
    jest.spyOn(port, 'vtexProductToNostoData').mockImplementation(() => nostoData);
  }

  jest.spyOn(port, 'hasNostoProduct').mockImplementation(() => Promise.resolve(hasNostoProduct));

  return {
    ...port,
    productId,
  };
}

async function execute(port?: CreatePortParams): Promise<SendProductPort>;
async function execute(originalPort?: CreatePortParams) {
  const port = createPort(originalPort);

  const useCase = new SendProductUseCase(port);
  await useCase.execute();
  return port;
}

describe('send-product use-case', () => {
  it('should be a class', () => {
    expect(typeof SendProductUseCase).toBe('function');
  });

  it('should get vtex product', async () => {
    const productId = '123';
    const port = await execute({ productId });
    expect(port.getVtexProduct).toHaveBeenCalledWith();
  });

  it('should not transform product if there is none', async () => {
    const port = await execute();
    expect(port.vtexProductToNostoData).not.toHaveBeenCalled();
  });

  it('should transform vtex product to nosto product', async () => {
    const product = { foo: 'bar' };
    const port = await execute({ product });
    expect(port.vtexProductToNostoData).toHaveBeenCalledWith(product);
  });

  it('should call hasProduct', async () => {
    const product = { foo: 'bar' };
    const nostoData = { productId: 'nosto-id' };
    const port = await execute({ product, nostoData });
    expect(port.hasNostoProduct).toHaveBeenCalledWith();
  });

  it('should call sendUpdateProduct if there is a nosto product', async () => {
    const port = await execute({ hasNostoProduct: true, hasVtexProduct: true });
    expect(port.sendUpdateProduct).toHaveBeenCalled();
  });

  it('should call sendUpdateProduct with nosto data', async () => {
    const nostoData = { productId: 'foo' };
    const port = await execute({ hasNostoProduct: true, hasVtexProduct: true, nostoData });
    expect(port.sendUpdateProduct).toHaveBeenCalledWith(nostoData);
  });

  it('should call sendNewProduct if there is no nosto product', async () => {
    const port = await execute({ hasNostoProduct: false, hasVtexProduct: true });
    expect(port.sendNewProduct).toHaveBeenCalled();
  });

  it('should call sendNewProduct with nosto data', async () => {
    const nostoData = { productId: 'foo' };
    const port = await execute({ hasNostoProduct: false, hasVtexProduct: true, nostoData });
    expect(port.sendNewProduct).toHaveBeenCalledWith(nostoData);
  });
});
