const PRODUCTS_SCHEMA = {
  ENTITY_NAME: 'nosto_products',
  SCHEMA_NAME: '0.0.1',
  SCHEMA_BODY: {
    title: 'Nosto products scan',
    properties: {
      productId: {
        type: 'string',
        title: 'Product ID',
      },
      lastScan: {
        type: 'integer',
        title: 'Timestamp of last scan',
      },
      lastUpdate: {
        type: 'integer',
        title: 'Timestamp of last update',
      },
      lastNotification: {
        type: 'integer',
        title: 'Timestamp of last sku change notification',
      },
      waitingIndexSince: {
        type: 'integer',
        title: 'First notification since lastUpdate',
      },
    },
    'v-required-fields': ['productId', 'lastScan', 'lastUpdate', 'lastNotification', 'waitingIndexSince'],
    'v-default-fields': ['productId', 'lastScan', 'lastUpdate', 'lastNotification', 'waitingIndexSince'],
    'v-indexed': ['productId', 'lastScan', 'lastUpdate', 'lastNotification', 'waitingIndexSince'],
    'v-cache': false,
    'v-security': {
      allowGetAll: true,
    },
  },
};

export default PRODUCTS_SCHEMA;
