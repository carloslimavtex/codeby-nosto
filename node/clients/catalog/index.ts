import { JanusClient, IOContext, InstanceOptions } from '@vtex/api';
import * as htmlparser2 from 'htmlparser2';
import * as CSSselect from 'css-select';
import { productsCurrentTime } from '../../utils/events';

export interface ListProductsData {
  data: Record<string, number[]>;
  range: {
    total: number;
    from: number;
    to: number;
  };
}

export default class Catalog extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: context.authToken,
      },
    });
  }

  public async getProduct(productId: string): Promise<unknown> {
    const response = await this.http.get('/api/catalog_system/pub/products/search', {
      params: { fq: `productId:${productId}` },
      metric: 'vtex-get-product',
    });
    return response[0];
  }

  public async listProducts(page = 1): Promise<ListProductsData> {
    return this.http.get('/api/catalog_system/pvt/products/GetProductAndSkuIds', {
      params: {
        _from: (page - 1) * 50 + 1,
        _to: page * 50,
      },
      metric: 'vtex-list-products',
    });
  }

  public async getProductIndexedTimestamp(productId: string): Promise<undefined | number> {
    const stringText = await this.http.get(`/api/catalog_system/pvt/products/GetIndexedInfo/${productId}`, {
      metric: 'vtex-product-indexed-info',
    });

    const xml = stringText[0] === '"' ? JSON.parse(stringText) : stringText;

    const date = this.getTimestampFromXml(xml);

    return date ? productsCurrentTime(date) : undefined;
  }

  protected getTimestampFromXml(xml: string) {
    const xmlDocument = htmlparser2.parseDocument(xml);
    const lastUpdateEl = CSSselect.selectOne('[name=catalogLastUpdateUtc]', xmlDocument);
    if (!lastUpdateEl) {
      return;
    }
    const dateString = htmlparser2.DomUtils.innerText(lastUpdateEl);
    return this.getDateFromDateStringOrUndefined(dateString);
  }

  protected getDateFromDateStringOrUndefined(date?: string): Date | undefined {
    if (date) {
      return new Date(date);
    }
    return undefined;
  }
}
