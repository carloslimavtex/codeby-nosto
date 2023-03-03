import { generateProductData } from '../../../../react/store/product-page/utils';
import { InputVendorProductEntity } from '../../../clients/nosto/graphql';
import { PortNostoData } from '../use-case';

type ProductData = ReturnType<typeof generateProductData>;

export default function nostoDataToNostoProduct(originalData: PortNostoData): InputVendorProductEntity {
  const data = originalData as ProductData;
  const {
    alternateImageUrls,
    availabilityString: availability,
    brand,
    categories,
    description,
    imageUrl,
    inventoryLevel,
    listPrice,
    name,
    price,
    priceCurrencyCode,
    productId,
    skus,
    url,
  } = data;

  return {
    alternateImageUrls,
    availability,
    brand,
    categories,
    description,
    imageUrl,
    inventoryLevel,
    listPrice,
    name,
    price,
    priceCurrencyCode,
    productId,
    skus: skus.map((sku) => {
      const {
        // customFields,
        availabilityString: availability,
        id,
        imageUrl,
        inventoryLevel,
        listPrice,
        name,
        price,
        url,
      } = sku;

      return {
        // attributes: customFields.map((field) => ({ key: field.name, value: field.text })),
        availability,
        id,
        imageUrl,
        inventoryLevel,
        listPrice,
        name,
        price,
        url,
      };
    }),
    url,
  };
}
