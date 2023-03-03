import React from 'react';
import { useProduct } from 'vtex.product-context';
import slugify from 'slugify';
import { useRuntime } from 'vtex.render-runtime/react/components/RenderContext';

import type { SkuData } from './utils';
import { generateProductData } from './utils';

declare const global: {
  __hostname__: string;
  __pathname__: string;
};

const NostoProductPageServer: React.FC = () => {
  const { product } = useProduct() ?? {};
  const {
    culture: { currency },
    workspace,
  } = useRuntime();

  if (!product) {
    return <div className="nosto_product no_product" style={{ display: 'none' }} />;
  }

  const data = generateProductData(product, {
    currency,
    host: global.__hostname__ ?? window.location.hostname,
    workspace,
  });

  return (
    <>
      <div className="nosto_page_type" style={{ display: 'none' }}>
        product
      </div>
      <div className="nosto_product" style={{ display: 'none' }}>
        <span className="product_id">{data.productId}</span>
        <span className="name">{data.name}</span>
        <span className="url">{data.url}</span>
        {data.imageUrl && <span className="image_url">{data.imageUrl}</span>}
        {data.alternateImageUrls.map((image) => (
          <span key={image} className="alternate_image_url">
            {image}
          </span>
        ))}
        <span className="price">{data.price}</span>
        <span className="list_price">{data.listPrice}</span>
        <span className="price_currency_code">{data.priceCurrencyCode}</span>
        {/* <span className="variation_id">{currency}</span> */}
        <span className="brand">{data.brand}</span>
        <span className="availability">{data.availabilityString}</span>
        {data.categories.map((category) => (
          <span key={category} className="category">
            {category}
          </span>
        ))}
        <span className="description">{data.description}</span>
        {data.skus.map((sku) => (
          <SkuRender key={sku.id} data={sku} />
        ))}
      </div>
    </>
  );
};

export default NostoProductPageServer;

const SkuRender: React.FC<{ data: SkuData }> = ({ data }) => {
  return (
    <span className="nosto_sku">
      <span className="id">{data.id}</span>
      <span className="name">{data.name}</span>
      <span className="price">{data.price}</span>
      <span className="list_price">{data.listPrice}</span>
      <span className="price_currency_code">{data.priceCurrencyCode}</span>
      {/* <span className="variation_id">{data.currency}</span> */}
      <span className="url">{data.url}</span>
      {data.imageUrl && <span className="image_url">{data.imageUrl}</span>}
      {data.alternateImageUrls.map((url) => (
        <span key={url} className="alternate_image_url">
          {url}
        </span>
      ))}
      <span className="availability">{data.availabilityString}</span>
      {!!data.customFields.length && (
        <span className="custom_fields">
          {data.customFields.map((field) => (
            <span key={field.name} className={slugify(field.name)}>
              {field.text}
            </span>
          ))}
        </span>
      )}
    </span>
  );
};
