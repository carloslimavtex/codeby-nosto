import { Product, SendAllProductsPort, SendAllProductsUseCase } from './use-case';

function voidPromise() {
  return jest.fn(() => {
    return Promise.resolve();
  });
}

function errorPromise<T>(): () => Promise<T> {
  return jest.fn(() => {
    return Promise.reject(null as unknown as T);
  });
}

function emptyPort(): SendAllProductsPort {
  return {
    lastScan: 10,
    callDeletedProductsVerification: voidPromise(),
    callNextPage: voidPromise(),
    sendProduct: voidPromise(),
    updateProduct: voidPromise(),
    getListProductsData: errorPromise(),
    getProduct: errorPromise(),
  };
}

type CreatePortParams = {
  lastScan?: number;
  newerLastScan?: boolean;
  productIds?: string[];
  hasMore?: boolean;
  getProduct?: SendAllProductsPort['getProduct'];
};
function createPort(args: CreatePortParams = {}): SendAllProductsPort {
  const { lastScan = 0, newerLastScan = false, productIds = [], hasMore = false, getProduct } = args;

  return {
    ...emptyPort(),
    lastScan: newerLastScan ? lastScan + 1 : lastScan,
    getListProductsData: jest.fn(async () => {
      return {
        productIds,
        hasMore,
      };
    }),
    getProduct: jest.fn(getProduct ?? defaultGetProduct(lastScan)),
  };
}

function defaultGetProduct(lastScan: number): SendAllProductsPort['getProduct'] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_: string) => Promise.resolve({ lastScan });
}

function isPort(port: unknown): port is SendAllProductsPort {
  return Object.hasOwnProperty.call(port, 'getListProductsData');
}

async function execute(port: SendAllProductsPort): Promise<SendAllProductsPort>;
async function execute(port?: CreatePortParams): Promise<SendAllProductsPort>;
async function execute(originalPort?: SendAllProductsPort | CreatePortParams) {
  let port: SendAllProductsPort;

  if (!originalPort || !isPort(originalPort)) {
    port = createPort(originalPort);
  } else {
    port = originalPort;
  }

  const useCase = new SendAllProductsUseCase(port);
  await useCase.execute();
  return port;
}

describe('send-all-products use-case', () => {
  it('should be a class', () => {
    expect(typeof SendAllProductsUseCase).toBe('function');
  });

  it('should get list of products', async () => {
    const port = await execute();
    expect(port.getListProductsData).toHaveBeenCalled();
  });

  describe('when there is no products', () => {
    let port: SendAllProductsPort;
    beforeEach(async () => {
      port = createPort({ productIds: [], hasMore: false });
      await execute(port);
    });

    it('should not call getProduct', () => {
      expect(port.getProduct).not.toHaveBeenCalled();
    });

    it('should not call next page', () => {
      expect(port.callNextPage).not.toHaveBeenCalled();
    });

    it('should call verification of deleted products', () => {
      expect(port.callDeletedProductsVerification).toHaveBeenCalled();
    });
  });

  describe('when there products', () => {
    const productIdsToBeNewer = ['1', '2'];
    const productIdsToBeOlder = ['3', '4'];
    const productIdsToNotUpdate = ['5', '6'];
    const productIds = [...productIdsToNotUpdate, ...productIdsToBeNewer, ...productIdsToBeOlder];

    function portLastScanIsTheSame() {
      return execute({ productIds });
    }

    function portLastScanIsNewer() {
      return execute({ productIds, newerLastScan: true });
    }

    function portLastScanIsDifferent() {
      const lastScan = 123;
      return execute({
        productIds,
        lastScan,
        getProduct: async (productId: string) => {
          let productScan = lastScan;
          if (productIdsToBeNewer.includes(productId)) {
            productScan++;
          } else if (productIdsToBeOlder.includes(productId)) {
            productScan--;
          }

          return {
            lastScan: productScan,
          };
        },
      });
    }

    async function portSelectedProducts() {
      const lastScan = 123;
      const ids = productIds.slice(0, 2);
      const products = ids.reduce((acc, id) => {
        acc[id] = {
          lastScan: 321,
        };

        return acc;
      }, {} as Record<string, Product>);
      return {
        port: await execute({
          productIds,
          lastScan,
          getProduct: async (productId: string) => {
            if (ids.includes(productId)) {
              return products[productId];
            }
            return {
              lastScan,
            };
          },
        }),
        lastScan,
        ids,
        products,
      };
    }

    it('should call getProduct for each product', async () => {
      const port = await execute({ productIds });
      expect(port.getProduct).toHaveBeenCalledTimes(productIds.length);
    });

    it('should not call updateProduct if lastScan is the same', async () => {
      const port = await portLastScanIsTheSame();
      expect(port.updateProduct).not.toHaveBeenCalled();
    });

    it('should call updateProduct if lastScan is newer', async () => {
      const port = await portLastScanIsNewer();
      expect(port.updateProduct).toHaveBeenCalledTimes(productIds.length);
    });

    it('should only call updateProduct if lastScan is different', async () => {
      const port = await portLastScanIsDifferent();
      expect(port.updateProduct).toHaveBeenCalledTimes(productIds.length - productIdsToNotUpdate.length);
    });

    it('should call updateProduct with lastScan and returned product', async () => {
      const { port, ids, lastScan, products } = await portSelectedProducts();
      expect(port.updateProduct).toHaveBeenCalledTimes(ids.length);
      for (const id of ids) {
        expect(port.updateProduct).toHaveBeenCalledWith(id, lastScan, products[id]);
      }
    });

    it('should not call sendProduct if lastScan is the same', async () => {
      const port = await portLastScanIsTheSame();
      expect(port.sendProduct).not.toHaveBeenCalled();
    });

    it('should call sendProduct if lastScan is newer', async () => {
      const port = await portLastScanIsNewer();
      expect(port.sendProduct).toHaveBeenCalledTimes(productIds.length);
    });

    it('should only call sendProduct if lastScan is different', async () => {
      const port = await portLastScanIsDifferent();
      expect(port.sendProduct).toHaveBeenCalledTimes(productIds.length - productIdsToNotUpdate.length);
    });

    it('should call sendProduct with lastScan and returned product', async () => {
      const { port, ids } = await portSelectedProducts();
      expect(port.sendProduct).toHaveBeenCalledTimes(ids.length);
      for (const id of ids) {
        expect(port.sendProduct).toHaveBeenCalledWith(id);
      }
    });

    describe("and there's no next page", () => {
      function portNoNextPage() {
        return execute({
          productIds,
          hasMore: false,
        });
      }
      it('should call callDeletedProductsVerification', async () => {
        const port = await portNoNextPage();
        expect(port.callDeletedProductsVerification).toHaveBeenCalled();
      });

      it('should not call callNextPage', async () => {
        const port = await portNoNextPage();
        expect(port.callNextPage).not.toHaveBeenCalled();
      });
    });

    describe("and there's a next page", () => {
      function portNoNextPage() {
        return execute({
          productIds,
          hasMore: true,
        });
      }
      it('should call callDeletedProductsVerification', async () => {
        const port = await portNoNextPage();
        expect(port.callDeletedProductsVerification).not.toHaveBeenCalled();
      });

      it('should not call callNextPage', async () => {
        const port = await portNoNextPage();
        expect(port.callNextPage).toHaveBeenCalled();
      });
    });
  });
});
