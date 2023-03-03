import { useEffect, useState } from 'react';
import type { Product, Item, Seller } from 'vtex.product-context/react/ProductTypes';
import { useOrderItems } from 'vtex.order-items/OrderItems';

import type { SkuToCartData } from '../typings/nosto';
import type { CartItem } from './utils/catalogItemToCart';
import { mapCatalogItemToCart } from './utils/catalogItemToCart';
import useNostoDependencies from '../hooks/use-nosto-dependencies';

type PromiseToResolve = {
  resolve: (data: boolean) => void;
  reject: (data: unknown) => void;
};

const NostoCart: React.FC = () => {
  const { addItems } = useOrderItems();
  const { allDataFinished, nostojs } = useNostoDependencies({ usePlacements: false, startWithLoad: false });
  const [updateProducts, setUpdateProducts] = useState<string[][]>([]);
  const [promiseToResolve, setPromiseToResolve] = useState<PromiseToResolve>();

  useEffect(() => {
    if (!allDataFinished) {
      return;
    }

    window.Nosto.addSkuToCart = addSkuToCart;
    window.Nosto.addMultipleSkuToCart = addMultipleSkuToCart;

    return () => {
      if (window.Nosto.addSkuToCart === addSkuToCart) {
        window.Nosto.addSkuToCart = () => Promise.reject('Add nosto-cart!');
      }

      if (window.Nosto.addMultipleSkuToCart === addMultipleSkuToCart) {
        window.Nosto.addMultipleSkuToCart = () => Promise.reject('Add nosto-cart!');
      }
    };

    async function addSkuToCart(data: SkuToCartData, element: HTMLElement) {
      return addMultipleSkuToCart([data], element);
    }

    async function addMultipleSkuToCart(allDataOriginal: SkuToCartData[], element: HTMLElement) {
      const placementId = getPlacementId(element);
      const allData = transformSkuData(allDataOriginal);
      const productIds: Set<string> = new Set();
      const skuIds: Set<string> = new Set();

      for (const data of allData) {
        if (data.skuId) {
          skuIds.add(data.skuId);
        } else if (data.productId) {
          productIds.add(data.productId);
        }
      }

      const products = await getProductsDataFor([...productIds], [...skuIds]);

      const skus: GetProductDataForReturn[] = [];

      for (const data of allData) {
        skus.push(getProductDataFor(products, data));
      }

      const cartItems: CartItem[] = [];

      for (const sku of skus) {
        cartItems.push(mapCatalogItemToCart(sku)[0]);
      }

      await addItems(cartItems);

      const newCartItems = cartItems.map((cartItem) => [cartItem.productId, placementId]);

      // need to let react run another loop to get updated cart
      setUpdateProducts([...updateProducts, ...newCartItems]);

      return new Promise<boolean>((resolve, reject) => {
        setPromiseToResolve({ resolve, reject });
      });
    }
  }, [addItems, allDataFinished, updateProducts]);

  useEffect(() => {
    if (!updateProducts.length || !allDataFinished || !promiseToResolve) {
      return;
    }

    setUpdateProducts([]);
    setPromiseToResolve(undefined);

    updateProducts
      .reduce((acc, [productId, placementId]) => {
        return acc.then(() => {
          return nostojs((api) => {
            return api.reportAddToCart(productId, placementId);
          });
        });
      }, Promise.resolve<unknown>(true))
      .then(() => promiseToResolve.resolve(true))
      .catch(promiseToResolve.reject);
  }, [nostojs, allDataFinished, updateProducts, promiseToResolve]);

  return null;
};

export default NostoCart;

function getPlacementId(element: HTMLElement): string {
  if (!element) {
    throw new Error('You need to pass the clicked HTMLElement!');
  }

  const id = element.closest('.nosto_element')?.id;

  if (!id) {
    throw new Error("Can't find nosto element!");
  }

  return id;
}

type GetProductDataForReturn = {
  product: Product;
  selectedItem: Item;
  selectedSeller: Seller;
  selectedQuantity: number;
};
function getProductDataFor(products: Product[], selected: SkuToCartData): GetProductDataForReturn {
  let product: Product | undefined;
  let item: Item | undefined;
  let seller: Seller | undefined;
  const { skuId, productId, quantity: sQuantity } = selected;
  const quantity = Math.max(sQuantity ?? 1, 1);

  if (skuId) {
    for (const loopProduct of products) {
      for (const loopItem of loopProduct.items) {
        if (loopItem.itemId === skuId) {
          item = loopItem;
          product = loopProduct;
          break;
        }
      }
    }

    if (!item) {
      throw new Error(`Can't find SKU with ID ${skuId}`);
    }
  }

  if (!product && productId) {
    product = products.find((findProduct) => findProduct.productId === productId);
  }

  if (!product) {
    throw new Error(`Can't find product with ID ${productId}`);
  }

  if (!item) {
    const validItems = product.items.filter((pItem) => {
      return pItem.sellers.some((iSeller) => iSeller.commertialOffer.AvailableQuantity >= quantity);
    });

    if (validItems.length !== 1) {
      throw new Error(`Too many SKUs to automatic select on product ${productId}`);
    }

    item = validItems[0];
  }

  if (!seller) {
    seller = item.sellers
      .filter((iSeller) => iSeller.commertialOffer.AvailableQuantity >= quantity)
      .sort((a, b) => a.commertialOffer.Price - b.commertialOffer.Price)[0];
  }

  return {
    product,
    selectedItem: item,
    selectedSeller: seller,
    selectedQuantity: quantity,
  };
}

async function getProductsDataFor(productIds?: string[], skuIds?: string[]): Promise<Product[]> {
  const productData: Product[] = [];
  const productIdSet: Set<string> = new Set();
  const skuIdSet: Set<string> = new Set();

  if (productIds?.length) {
    const ids = new Set(productIds.map((productId) => `productId:${productId}`));

    const results = await Promise.all(chunkArrayInGroups([...ids], 50).map((group) => getProducts(group)));

    for (const group of results) {
      for (const product of group) {
        if (!productIdSet.has(product.productId)) {
          productIdSet.add(product.productId);
          product.items.forEach((sku) => skuIdSet.add(sku.itemId));
          productData.push(product);
        }
      }
    }
  }

  if (skuIds?.length) {
    const ids = [...new Set([...skuIds])];

    while (ids.length) {
      const group: Set<string> = new Set();

      while (ids.length && group.size < 50) {
        const skuId = ids.pop();

        if (skuId && !skuIdSet.has(skuId)) {
          group.add(`skuId:${skuId}`);
        }
      }

      if (!group.size) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      const results = await getProducts([...group]);

      for (const product of results) {
        if (!productIdSet.has(product.productId)) {
          productIdSet.add(product.productId);
          product.items.forEach((sku) => skuIdSet.add(sku.itemId));
          productData.push(product);
        }
      }
    }
  }

  return productData;
}

async function getProducts(fqs: string[]): Promise<Product[]> {
  const params = new URLSearchParams();

  fqs.forEach((fq) => params.append('fq', fq));

  const url = `/api/catalog_system/pub/products/search?${params.toString()}`;

  return fetch(url).then((response) => response.json());
}

function chunkArrayInGroups<T>(arr: T[], size: number) {
  const result = [];

  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));

  return result;
}

function transformSkuData(allData: SkuToCartData[]): SkuToCartData[] {
  return allData.map((data) => {
    const newData = { ...data };

    if (newData.productId) {
      newData.productId = String(newData.productId);
    }

    if (newData.skuId) {
      newData.skuId = String(newData.skuId);
    }

    if (newData.quantity) {
      newData.quantity = parseInt(String(newData.quantity), 10);
    }

    return newData;
  });
}
