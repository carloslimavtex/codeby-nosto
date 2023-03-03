import { Events, IOContext } from '@vtex/api';
import sendAllProductsMiddleware, { sendAllProductsMiddlewareExecution } from '.';
import Catalog from '../../clients/catalog';
import Products from '../../clients/products';
import sendAllProductsPort from './port';

jest.mock('@vtex/api');
jest.mock('../../clients/catalog');
jest.mock('../../clients/products');
jest.mock('./use-case');
jest.mock('./port');

const ioContext = {} as unknown as IOContext;

function createParams(page = 1, lastScan = 123): { context: Context; next: () => Promise<void> } {
  return {
    context: createContext(page, lastScan),
    next: jest.fn(() => Promise.resolve()),
  };
}

function createContext(page = 1, lastScan = 123): Context {
  return {
    clients: {
      catalog: new Catalog(ioContext),
      events: new Events(ioContext),
      products: new Products(ioContext),
    },
    body: {
      page,
      lastScan,
    },
  } as unknown as Context;
}

describe('sendAllProducts middleware', () => {
  it('should be a function', () => {
    expect(typeof sendAllProductsMiddleware).toBe('function');
  });

  it('should call next', async () => {
    const { context, next } = createParams();
    await sendAllProductsMiddleware(context, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('sendAllProductsMiddlewareExecution', () => {
  it('should be a function', () => {
    expect(typeof sendAllProductsMiddlewareExecution).toBe('function');
  });

  it('should create port with correct data', async () => {
    const page = 2;
    const lastScan = 123;
    const context = createContext(page, lastScan);
    const {
      clients: { catalog, events, products },
    } = context;

    sendAllProductsMiddlewareExecution(context);

    expect(sendAllProductsPort).toHaveBeenCalledWith({
      lastScan,
      page,
      catalog,
      events,
      products,
    });
  });
});
