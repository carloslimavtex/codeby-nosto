import type { Product } from 'vtex.product-context/react/ProductTypes';
import slugify from 'slugify';

function getPriceRange(product: Product) {
  if (product.priceRange) {
    return {
      listPrice: product.priceRange.listPrice.lowPrice,
      price: product.priceRange.sellingPrice.lowPrice,
    };
  }

  let listPrice = Infinity;
  let price = Infinity;

  for (const sku of product.items) {
    for (const seller of sku.sellers) {
      if (seller.commertialOffer.ListPrice < listPrice) {
        listPrice = seller.commertialOffer.ListPrice;
      }

      if (seller.commertialOffer.Price < price) {
        price = seller.commertialOffer.Price;
      }
    }
  }

  return {
    listPrice,
    price,
  };
}

export function generateProductData(product: Product, args: GenerateSkuDataArgs) {
  const [imageUrl, ...alternateImageUrls] = product.items
    .map((item) => {
      return item.images.map((image) => image.imageUrl);
    })
    // .flat();
    .reduce((acc, val) => acc.concat(val), []);

  const skus = generateSkuData(product, args);
  const availability = skus.some((sku) => sku.availability);

  const { price, listPrice } = getPriceRange(product);

  return {
    productId: product.productId,
    name: product.productName,
    url: getProductUrl(product.link, { host: args.host, workspace: args.workspace }),
    imageUrl,
    alternateImageUrls,
    price,
    listPrice,
    inventoryLevel: skus.reduce((acc, sku) => acc + sku.inventoryLevel, 0),
    priceCurrencyCode: args.currency,
    brand: product.brand,
    availability,
    availabilityString: availability ? 'InStock' : 'OutOfStock',
    categories: [...product.categories],
    description: product.description,
    skus,
  };
}

export type SkuData = ReturnType<typeof generateSkuData>[number];
export type GenerateSkuDataArgs = {
  currency: string;
  host: string;
  workspace?: string;
};
export function generateSkuData(product: Product, { currency, host, workspace }: GenerateSkuDataArgs) {
  const productUrl = getProductUrl(product.link, { host, workspace });

  return product.items
    .map((item) => {
      let lowestPrice: number | undefined;
      let lowestActivePrice: number | undefined;
      let lowestListPrice: number | undefined;
      let lowestActiveListPrice: number | undefined;
      let hasActiveSeller = false;
      let inventoryLevel = 0;

      const [mainImage, ...altImages] = item.images;

      item.sellers.forEach((seller) => {
        const price = seller.commertialOffer.Price;
        const listPrice = seller.commertialOffer.ListPrice;
        const inventory = seller.commertialOffer.AvailableQuantity;

        if (inventory > 0) {
          lowestActivePrice = Math.min(price, lowestActivePrice ?? Infinity);
          lowestActiveListPrice = Math.min(listPrice, lowestActiveListPrice ?? Infinity);
          hasActiveSeller = true;
          inventoryLevel += inventory;
        }

        lowestPrice = Math.min(price, lowestPrice ?? Infinity);
        lowestListPrice = Math.min(listPrice, lowestListPrice ?? Infinity);
      });

      const customFields: Array<{ name: string; text: string }> = [];

      if (item.variations?.length) {
        if (typeof item.variations[0] === 'string') {
          const variants = item.variations as unknown as string[];

          customFields.push(
            ...variants.map((variant: string) => ({
              name: slugify(variant),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              text: (item as any)[variant]?.[0] || '????',
            }))
          );
        } else {
          customFields.push(
            ...item.variations.map((variant) => ({
              name: slugify(variant.name),
              text: variant.values.join(', '),
            }))
          );
        }
      }

      return {
        id: item.itemId,
        name: item.name,
        price: lowestActivePrice ?? lowestPrice,
        listPrice: lowestActiveListPrice ?? lowestListPrice ?? lowestPrice,
        url: productUrl,
        imageUrl: mainImage.imageUrl,
        alternateImageUrls: altImages.map((image) => image.imageUrl),
        availability: hasActiveSeller,
        availabilityString: hasActiveSeller ? 'InStock' : 'OutOfStock',
        priceCurrencyCode: currency,
        inventoryLevel,
        customFields,
      };
    })
    .filter((item) => item.price !== undefined);
}

export type GetProductUrlArgs = {
  workspace?: string;
  host: string;
};
export function getProductUrl(link: string, { workspace, host }: GetProductUrlArgs) {
  // no URL class on vtex server :(

  let newLink = link.replace(/^([^:]+:\/\/)([^/]+)(\/|$)/, `$1${host}$3`);

  if (workspace && workspace !== 'master') {
    newLink = `${newLink}${newLink.includes('?') ? '&' : '?'}`;
    newLink = `${newLink}workspace=${workspace}`;
  }

  return newLink;
}
