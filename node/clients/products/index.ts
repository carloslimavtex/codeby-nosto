import { MasterData } from '@vtex/api';
import PRODUCTS_SCHEMA from '../../schemas/products';
import { AsyncType } from '../../utils/generic';
import { consoleInfo } from '../../utils/console';
import Product, { productFields, defaultData, MAXIMUM_VTEX_NUMBER } from './product';
import { isEmpty } from 'ramda';

export interface GetProductOptions {
  isDocumentId?: boolean;
}

export type CreateProductArgs = Partial<Pick<Product, 'lastScan' | 'lastUpdate'>>;

export type ScrollResponse = [string, string[]];
export type DeletedProductIds = ScrollResponse;
export type MissingProductIds = ScrollResponse;

interface ScrollInput {
  dataEntity: string;
  fields: string[];
  where?: string;
  schema?: string;
  sort?: string;
  size?: number;
  mdToken?: string;
}

export default class Products extends MasterData {
  private createdTable = false;
  private async createTables(): Promise<void> {
    if (!this.createdTable) {
      await this.ignoreIfNotModified(async () => {
        await this.createOrUpdateSchema({
          dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
          schemaName: PRODUCTS_SCHEMA.SCHEMA_NAME,
          schemaBody: PRODUCTS_SCHEMA.SCHEMA_BODY,
        });
        this.createdTable = true;
      });
    }
  }

  private async ignoreIfNotModified<T>(cb: () => Promise<T>): Promise<T | void> {
    try {
      return await cb();
    } catch (err) {
      if (err.response?.status !== 304) {
        throw err;
      }
    }
  }

  public async getOrCreateProduct(productId: string, data?: CreateProductArgs): Promise<Product> {
    let product = await this.getProduct(productId);
    if (!product) {
      const id = await this.createProduct(productId, data);
      product = await this.getProduct(id, { isDocumentId: true });
    }

    if (!product) {
      throw new Error(`products.getOrCreateProduct: Can't find nor create product for productId: ${productId}`);
    }

    return product;
  }

  public async getProduct(productId: string, opts?: GetProductOptions): Promise<Product | void> {
    await this.createTables();
    let response: Product[];

    if (opts?.isDocumentId) {
      response = [
        await this.getDocument<Product>({
          dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
          id: productId,
          fields: ['id', 'productId', ...productFields],
        }),
      ];
    } else {
      response = await this.searchDocuments<Product>({
        dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
        schema: PRODUCTS_SCHEMA.SCHEMA_NAME,
        fields: ['id', 'productId', ...productFields],
        pagination: {
          page: 1,
          pageSize: 100,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        where: `productId = '${productId}'`,
      });
    }

    if (response.length > 1) {
      const [, ...productsToDelete] = response;
      const promises = productsToDelete.map((product) =>
        this.deleteDocument({
          dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
          id: product.id,
        })
      );
      await Promise.all(promises);
    }

    return response[0] ? Product.fromMasterData(response[0]) : undefined;
  }

  private async createProduct(productId: string, data?: CreateProductArgs): Promise<string> {
    await this.createTables();

    const response = await this.createDocument({
      dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
      schema: PRODUCTS_SCHEMA.SCHEMA_NAME,
      fields: {
        ...defaultData,
        ...data,
        productId,
      },
    });

    return response.DocumentId;
  }

  public async updateIfHasChanges(documentId: string, data: Record<string, unknown>): Promise<void> {
    if (isEmpty(data)) {
      return;
    }
    return this.updatePartialDocumentAndIgnoreIfNotModified(documentId, data);
  }

  protected updatePartialDocumentAndIgnoreIfNotModified(id: string, fields: object) {
    // consoleInfo('products.updatePartialDocumentAndIgnoreIfNotModified', id, JSON.stringify(fields));
    return this.ignoreIfNotModified(async () => {
      await this.updatePartialDocument({
        dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
        schema: PRODUCTS_SCHEMA.SCHEMA_NAME,
        id,
        fields,
      });
    });
  }

  public async deleteProduct(productId: string): Promise<void> {
    const doc = await this.getProduct(productId);
    if (!doc) {
      return;
    }

    await this.deleteDocument({
      dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
      id: doc.id,
    });
  }

  public async getDeletedProductIds(lastScan: number, token?: string): Promise<DeletedProductIds> {
    if (lastScan > MAXIMUM_VTEX_NUMBER) {
      throw new Error("products.getDeletedProductIds: can't search for lastScan > 2147483647 because of VTEX limits");
    }

    return this.getScrollFor({
      where: `(lastScan is null) OR (lastScan < ${lastScan})`,
      token,
    });
  }

  protected async getScrollFor({ where, token }: { where: string; token?: string }): Promise<ScrollResponse> {
    await this.createTables();

    let params: { mdToken: string } | { size: number; where: string };
    if (token) {
      params = {
        mdToken: token,
      };
    } else {
      params = {
        size: 50,
        where,
      };
    }

    const wrongResponse = await this.scrollOrDefault({
      dataEntity: PRODUCTS_SCHEMA.ENTITY_NAME,
      schema: PRODUCTS_SCHEMA.SCHEMA_NAME,
      fields: ['productId'],
      ...params,
    });

    // VTEX !!!!
    type ScrollResponse = typeof wrongResponse.data;
    const response = wrongResponse as unknown as ScrollResponse;

    return [response.mdToken, response.data.map((product) => product.productId)];
  }

  protected async scrollOrDefault(input: ScrollInput) {
    const promise = this.scrollDocuments<Pick<Product, 'productId'>>(input);
    type Response = AsyncType<typeof promise>;
    try {
      const response = await promise;

      consoleInfo('products.scrollOrDefault', JSON.stringify(input), JSON.stringify(response));

      return response;
    } catch (err) {
      consoleInfo('products.scrollOrDefault err', err.response?.status, JSON.stringify(err.response?.data));

      if (err.response?.status === 400) {
        let useEmptyResponse = false;

        if (err.response.data?.Message?.startsWith?.('Maximum simultaneous scrolls rate exceeded')) {
          useEmptyResponse = true;
        } else if (err.response.data?.Message?.startsWith?.('Operation not found for this token: ')) {
          useEmptyResponse = true;
        }

        if (useEmptyResponse) {
          return {
            mdToken: input.mdToken || '',
            data: [],
          } as unknown as Response;
        }
      }
      throw err;
    }
  }

  public async getMissingUpdateProductIds(token?: string): Promise<MissingProductIds> {
    return this.getScrollFor({
      where: 'waitingIndexSince > 0',
      token,
    });
  }
}
