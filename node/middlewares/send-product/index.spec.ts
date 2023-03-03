import { IOContext } from '@vtex/api';
import sendProductMiddleware, { sendProductMiddlewareExecution } from '.';
import Catalog from '../../clients/catalog';
import Nosto from '../../clients/nosto';
import sendProductPort from './port';

jest.mock('@vtex/api');
jest.mock('../../clients/catalog');
jest.mock('../../clients/nosto');
jest.mock('./use-case');
jest.mock('./port');

const ioContext = {} as unknown as IOContext;

function createParams(productId = '123'): { context: Context; next: () => Promise<void> } {
  return {
    context: createContext(productId),
    next: jest.fn(() => Promise.resolve()),
  };
}

function createContext(productId = '123'): Context {
  return {
    clients: {
      catalog: new Catalog(ioContext),
      nosto: new Nosto(ioContext),
    },
    body: {
      productId,
    },
  } as unknown as Context;
}

describe('sendProduct middleware', () => {
  it('should be a function', () => {
    expect(typeof sendProductMiddleware).toBe('function');
  });

  it('should call next', async () => {
    const { context, next } = createParams();
    await sendProductMiddleware(context, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('sendProductMiddlewareExecution', () => {
  it('should be a function', () => {
    expect(typeof sendProductMiddlewareExecution).toBe('function');
  });

  it('should create port with correct data', async () => {
    const productId = '345';
    const context = createContext(productId);
    const {
      clients: { catalog, nosto },
    } = context;

    sendProductMiddlewareExecution(context);

    expect(sendProductPort).toHaveBeenCalledWith({
      productId,
      catalog,
      nosto,
    });
  });
});
