export type InputKeyValueEntity = Record<string, string>;

export type InputVendorProductEntity = {
  ageGroup?: string;
  alternateImageUrls?: string[];
  attributes?: InputKeyValueEntity;
  availability?: string;
  brand?: string;
  categories?: string[];
  categoryIds?: string[];
  condition?: string;
  datePublished?: Date;
  description?: string;
  gender?: string;
  googleCategory?: string;
  gtin?: string;
  imageUrl?: string;
  /**
   * integer
   */
  inventoryLevel?: number;
  /**
   * float
   */
  listPrice?: number;
  name?: string;
  /**
   * float
   */
  price?: number;
  priceCurrencyCode?: string;
  productId: string;
  /**
   * integer
   */
  ratingValue?: number;
  /**
   * integer
   */
  reviewCount?: number;
  skus?: InputProductSkuEntity[];
  /**
   * float
   */
  supplierCost?: number;
  tags1?: string[];
  tags2?: string[];
  tags3?: string[];
  thumbUrl?: string;
  ugcImages?: InputUGCImageEntity[];
  /**
   * float
   */
  unitPricingBaseMeasure?: number;
  /**
   * float
   */
  unitPricingMeasure?: number;
  unitPricingUnit?: string;
  url: string;
  variantId?: string;
  variations?: InputProductVariationEntity[];
};

export type InputProductSkuEntity = {
  attributes?: InputKeyValueEntity[];
  availability?: string;
  id?: string;
  imageUrl?: string;
  /**
   * integer
   */
  inventoryLevel?: number;
  /**
   * float
   */
  listPrice?: number;
  name?: string;
  /**
   * float
   */
  price?: number;
  url?: string;
};

export type InputUGCImageEntity = {
  id: never;
};

export type InputProductVariationEntity = {
  id: never;
};

export const HAS_PRODUCT = `
query($productId: String!) {
  product(id: $productId) {
    productId
  }
}`;

export type GetProductToDelete = {
  product: {
    productId: string;
    url: string;
    availability: string;
  };
};
export const GET_PRODUCT_TO_DELETE = `
query($productId: String!) {
  product(id: $productId) {
    productId
    url
    availability
  }
}`;

export const CREATE_PRODUCT = `
mutation($products: [InputCreateProductEntity]!) {
  createProducts(products: $products) {
    result {
      data {
        productId
      }
      errors {
        field
        message
      }
    }
  }
}`;

export const UPDATE_PRODUCT = `
mutation($products: [InputVendorProductEntity]!) {
  updateProducts(products: $products) {
    result {
      data {
        productId
      }
      errors {
        field
        message
      }
    }
  }
}`;

// export type ProductBatch = {
//   hits: number;
//   products: {
//     productId: string;
//     availability: string;
//   }[];
// };
// export const LIST_ACTIVE_PRODUCTS = `
// query($limit: Int!, $offset: Int!) {
//   products(limit: $limit, offset: $offset, sort: { field: CREATED, reverse: false }) {
//     hits
//     products {
//       productId
//       availability
//     }
//   }
// }`;

export const UPDATE_ORDER = `
mutation($orderId: String!, $status: String!, $statusDate: LocalDateTime!) {
  updateStatus(number: $orderId, params: {
    orderStatus: $status,
    statusDate: $statusDate,
  }) {
    number
    statuses {
      date
      orderStatus
      paymentProvider
    }
  }
}
`;
