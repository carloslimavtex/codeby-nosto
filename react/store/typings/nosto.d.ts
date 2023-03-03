declare global {
  interface Window {
    nostojs: NostoJS;
    Nosto: NostoAddToCartContainer;
  }
}

export interface NostoCustomer {
  customer_reference: string;
  email?: string;
  first_name?: string;
  last_name?: sring;
  newsletter?: boolean;
}

export interface NostoCart {
  items: NostoCartItem[];
}

export interface NostoCartItem {
  name: string;
  price_currency_code: string;
  product_id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
}

export interface SkuToCartData {
  productId?: string;
  skuId?: string;
  quantity?: number;
}

export interface NostoAddToCartContainer {
  addSkuToCart: (data: SkuToCartData, element: HTMLElement) => Promise<boolean>;
  addMultipleSkuToCart: (data: SkuToCartData[], element: HTMLElement) => Promise<boolean>;
}
export interface NostoJS {
  (cb: (api: NostoApi) => void): void;
  q?: unknown[];
}

export interface NostoApi {
  defaultSession: () => NostoApiSession;
  placements: {
    getPlacements: () => string[];
    injectCampaigns: (data: unknown) => void;
  };
}

export interface NostoApiSession {
  setResponseMode: (mode: 'HTML') => NostoApiSession;
  setCustomer: (customer?: NostoCustomer | object | null) => NostoApiSession;
  setCart: (cart: NostoCart) => NostoApiSession;
  setVariation: (currency: string) => NostoApiSession;
  viewFrontPage: () => NostoApiSessionPage;
  viewProduct: (productId: string) => NostoApiSessionPage;
  viewSearch: (seach: string) => NostoApiSessionPage;
  viewCategory: (category: string) => NostoApiSessionPage;
  viewNotFound: () => NostoApiSessionPage;
  viewOther: () => NostoApiSessionPage;
  reportAddToCart: (productId: string, placement: string) => NostoApiSessionPage;
  addOrder: (order: NostoAddOrderProps) => NostoApiSessionPage;
}

export interface NostoApiSessionPage {
  setRef: (productId: string, refSrc: string) => NostoApiSessionPage;
  setPlacements: (placements: string[]) => NostoApiSessionPage;
  load(): Promise<NostoLoadResponse>;
  update(): Promise<NostoLoadResponse>;
}

export interface NostoLoadResponse {
  recommendations: unknown;
}

export interface NostoAddOrderProps {
  external_order_ref: string;
  info: NostoAddOrderInfo;
  items: NostoAddOrderItem[];
}

export type NostoAddOrderInfo = Omit<NostoCustomer, 'customer_reference'> & {
  order_number: string;
  type: 'order';
};

export type NostoAddOrderItem = NostoCartItem;
