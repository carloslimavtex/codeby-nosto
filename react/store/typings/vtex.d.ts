/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'vtex.order-manager/OrderForm' {
  export type OrderForm = {
    items: OrderFormItem[];
  };
  export type OrderFormItem = {
    id: string; // skuId
    productId: string; // productId
    refId: string; // sku ref id
    quantity: number;
    price: number;
    skuName: string;
  };
  export const useOrderForm: () => {
    orderForm: OrderForm;
    loading: boolean;
  };
}

declare module 'vtex.order-items/OrderItems' {
  interface SKUSpecification {
    fieldName: string;
    fieldValues: string[];
  }

  interface CartItem {
    detailUrl: string;
    id: string;
    ean: string;
    imageUrl: string;
    index?: number;
    listPrice: number;
    measurementUnit: string;
    name: string;
    price: number;
    productId: string;
    quantity: number;
    seller: string;
    sellerName: string;
    sellingPrice: number;
    productRefId: string;
    brand: string;
    variant: string;
    category: string;
    skuName: string;
    skuSpecifications: SKUSpecification[];
    uniqueId: string;
    sellingPriceWithAssemblies: number;
    options: Option[];
    assemblyOptions: ParsedAssemblyOptionsMeta;
    referenceId: Array<{
      Key: string;
      Value: string;
    }> | null;
  }

  export type OrderItems = {
    addItems: (skus: CartItem[]) => Promise<void>;
  };

  export const useOrderItems: () => OrderItems;
}

declare module 'vtex.search-page-context/SearchPageContext' {
  export type NavigationItem = {
    name: string;
    href: string;
  };

  export type SearchQuery = {
    data?: {
      productSearch?: {
        breadcrumb?: NavigationItem[];
      };
      facets?: {
        breadcrumb?: NavigationItem[];
      };
    };
  };
  export const useSearchPage: () => {
    searchQuery?: SearchQuery;
  };
}
