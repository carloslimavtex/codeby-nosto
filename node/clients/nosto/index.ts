import type { InstanceOptions, IOContext } from '@vtex/api';
import { ExternalClient } from '@vtex/api';

import { UPDATE_ORDER, HAS_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT, GET_PRODUCT_TO_DELETE } from './graphql';
import type { InputVendorProductEntity, GetProductToDelete } from './graphql';
import { consoleWarn } from '../../utils/console';

export const AVAILABILITY_DELETED = 'Discontinued';

export interface ErrorLogData {
  methodName: string;
  showQuery?: boolean;
  showVariables?: boolean;
}
export default class Nosto extends ExternalClient {
  public apiKey = '';
  public domain = '';
  public currency = '';
  public targetWorkspace = '';

  constructor(context: IOContext, options: InstanceOptions = {}) {
    super('https://api.nosto.com/v1/graphql', context, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });
  }

  private request<T = unknown>(
    query: string,
    variables: Record<string, unknown>,
    metric: string
  ): Promise<{ data: T; errors?: unknown }> {
    return this.http.post(
      '',
      {
        query,
        variables,
      },
      {
        metric,
        auth: {
          username: '',
          password: this.apiKey,
        },
      }
    );
  }

  private async boolRequest(query: string, variables: Record<string, unknown>, metric: string): Promise<boolean> {
    return this.boolRequestWithErrorLog(query, variables, metric);
  }

  private async boolRequestWithErrorLog(
    query: string,
    variables: Record<string, unknown>,
    metric: string,
    errorLog?: ErrorLogData
  ): Promise<boolean> {
    const response = await this.request(query, variables, metric);
    const isSuccessful = Array.isArray(response.errors) ? response.errors.length === 0 : !response.errors;
    if (!isSuccessful && errorLog) {
      const message: unknown[] = [];
      message.push(`nosto.${errorLog.methodName} boolRequest error.`);
      if (errorLog.showQuery) {
        message.push(' QUERY:');
        message.push(JSON.stringify(query));
      }
      if (errorLog.showVariables) {
        message.push(' VARIABLES:');
        message.push(JSON.stringify(variables));
      }
      message.push(' RESPONSE:');
      message.push(JSON.stringify(response));
      consoleWarn(message.join(''));
    }
    return isSuccessful;
  }

  public hasProduct(productId: string): Promise<boolean> {
    return this.boolRequest(HAS_PRODUCT, { productId }, 'nosto-has-product');
  }

  public createProduct(product: InputVendorProductEntity): Promise<boolean> {
    return this.boolRequestWithErrorLog(CREATE_PRODUCT, { products: [product] }, 'nosto-create-product', {
      methodName: 'createProduct',
      showVariables: true,
      showQuery: true,
    });
  }

  public updateProduct(product: InputVendorProductEntity): Promise<boolean> {
    return this.boolRequestWithErrorLog(UPDATE_PRODUCT, { products: [product] }, 'nosto-update-product', {
      methodName: 'updateProduct',
      showVariables: true,
      showQuery: true,
    });
  }

  public async deleteProduct(productId: string): Promise<boolean> {
    const { data } = await this.request<GetProductToDelete>(
      GET_PRODUCT_TO_DELETE,
      { productId },
      'nosto-get-product-to-delete'
    );

    if (!data?.product) {
      return false;
    }

    if (data.product.availability === AVAILABILITY_DELETED) {
      return false;
    }

    return await this.updateProduct({
      productId,
      url: data.product.url,
      availability: AVAILABILITY_DELETED,
    });
  }

  public updateOrder(
    orderId: string,
    status: string,
    statusDate: string /*, paymentProvider?: string */
  ): Promise<boolean> {
    return this.boolRequest(
      UPDATE_ORDER,
      {
        orderId,
        status,
        statusDate,
      },
      'nosto-update-order'
    );
  }
}
