type ProductId = string;

export type ListProductsData = {
  productIds: ProductId[];
  hasMore: boolean;
};

export type Product = {
  lastScan: number;
};

export type SendAllProductsPort = {
  lastScan: number;

  getListProductsData(): Promise<ListProductsData>;
  getProduct(productId: ProductId): Promise<Product>;
  updateProduct(productId: ProductId, lastScan: number, product: Product): Promise<void>;
  sendProduct(productId: ProductId): Promise<void>;
  callNextPage(): Promise<void>;
  callDeletedProductsVerification(): Promise<void>;
};

export class SendAllProductsUseCase {
  constructor(protected readonly port: SendAllProductsPort) {}

  public async execute(): Promise<void> {
    const {
      lastScan,
      getListProductsData,
      getProduct,
      updateProduct,
      callNextPage,
      callDeletedProductsVerification,
      sendProduct,
    } = this.port;
    const list = await getListProductsData();

    const productPromises = list.productIds.map(async (productId) => {
      const product = await getProduct(productId);
      if (product.lastScan === lastScan) {
        return;
      }
      await updateProduct(productId, lastScan, product);
      await sendProduct(productId);
    });

    await Promise.all(productPromises);

    if (list.hasMore) {
      await callNextPage();
    } else {
      await callDeletedProductsVerification();
    }
  }
}
