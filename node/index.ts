import {
  ClientsConfig,
  ServiceContext as ServiceCtx,
  RecorderState,
  EventContext,
  ParamsContext,
  Cached,
} from '@vtex/api';
import { LRUCache, Service } from '@vtex/api';

import { Clients } from './clients';
// import { settings } from './middlewares/settings';
// import { orderUpdated } from './middlewares/order-updated';
import locale from './middlewares/locale';
import throttleGenerator from './middlewares/throttle';
import settings from './middlewares/settings';
import sendAllProductsMiddleware from './middlewares/send-all-products';
import sendProductMiddleware from './middlewares/send-product';
import {
  verifyAllProductsInVtex,
  sendAllProducts,
  sendProduct,
  verifyUpdateOfAllProducts,
  verifyUpdateOfProduct,
  nostoWatcher,
  sendProductEvent,
} from './utils/events';
import verifyAllProductsInVtexMiddleware from './middlewares/verify-all-products-in-vtex';
import verifyProductInVtexMiddleware from './middlewares/verify-product-in-vtex';
import skuUpdateNotificationMiddleware from './middlewares/sku-update-notification';
import verifyUpdateOfAllProductsMiddleware from './middlewares/verify-update-of-all-products';
import verifyUpdateOfProductMiddleware from './middlewares/verify-update-of-product';
import generateSchedulerMiddleware from './middlewares/scheduler';
import httpErrorMiddleware from './middlewares/http-error';
import parallel from './utils/parallel';
import nostoEventMiddleware from './middlewares/nosto-event';
import nostoEventsWatcherMiddleware from './middlewares/nosto-events-watcher';

const TREE_SECONDS_MS = 3 * 1000;
const CONCURRENCY = 10;

const tenantCacheStorage = new LRUCache<string, Cached>({
  max: 3000,
});

const segmentCacheStorage = new LRUCache<string, Cached>({
  max: 3000,
});

metrics.trackCache('tenant', tenantCacheStorage);
metrics.trackCache('segment', segmentCacheStorage);

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    default: {
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 50,
      retries: 1,
      timeout: TREE_SECONDS_MS,
      concurrency: CONCURRENCY,
    },
    tenant: {
      memoryCache: tenantCacheStorage,
      timeout: TREE_SECONDS_MS,
    },
    segment: {
      memoryCache: segmentCacheStorage,
      timeout: TREE_SECONDS_MS,
    },
    events: {
      timeout: TREE_SECONDS_MS,
    },
    vbase: {
      concurrency: 5,
    },
  },
};

declare global {
  // We declare a global Context type just to avoid re-writing
  // ServiceContext<Clients, State> in every handler and resolver
  type ServiceContext = ServiceCtx<Clients, State, ParamsContext>;
  type Context = EventContext<Clients, State>;

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    code: number;
  }
}

const scheudlerMiddleware = generateSchedulerMiddleware();

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  events: {
    // orderStatusUpdated: [settings, orderUpdated],
    broadcasterNotification: [throttleGenerator(100), locale, scheudlerMiddleware, skuUpdateNotificationMiddleware],
    verifyAllProductsInVtex: [
      throttleGenerator(2),
      settings,
      httpErrorMiddleware,
      scheudlerMiddleware,
      nostoEventMiddleware,
      verifyAllProductsInVtexMiddleware,
    ],
    verifyProductInVtex: [
      throttleGenerator(100),
      settings,
      httpErrorMiddleware,
      scheudlerMiddleware,
      nostoEventMiddleware,
      verifyProductInVtexMiddleware,
    ],
    sendAllProducts: [
      throttleGenerator(2),
      settings,
      httpErrorMiddleware,
      scheudlerMiddleware,
      nostoEventMiddleware,
      sendAllProductsMiddleware,
    ],
    sendProduct: [
      throttleGenerator(50),
      settings,
      httpErrorMiddleware,
      scheudlerMiddleware,
      nostoEventMiddleware,
      sendProductMiddleware,
    ],
    verifyUpdateOfAllProducts: [
      throttleGenerator(2),
      settings,
      scheudlerMiddleware,
      nostoEventMiddleware,
      verifyUpdateOfAllProductsMiddleware,
    ],
    verifyUpdateOfProduct: [
      throttleGenerator(10),
      settings,
      scheudlerMiddleware,
      nostoEventMiddleware,
      verifyUpdateOfProductMiddleware,
    ],
    nostoEventsWatcher: [throttleGenerator(1), settings, scheudlerMiddleware, nostoEventsWatcherMiddleware],
  },

  routes: {
    sendAllProducts: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { eventSender },
      } = ctx;

      await eventSender({
        eventArgs: sendAllProducts(1),
      });

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      await next();
    },
    sendProduct: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { eventSender },
        vtex: { route },
      } = ctx;

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      await eventSender({
        eventArgs: sendProduct(String(route.params.productId)),
      });

      await next();
    },
    verifyAllProductsInVtex: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { eventSender },
        vtex: {
          route: {
            params: { scanTime },
          },
        },
      } = ctx;

      await eventSender({ eventArgs: verifyAllProductsInVtex(parseInt(String(scanTime), 10)) });

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      await next();
    },
    addProducts: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { products },
      } = ctx;

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      const productsData = await Promise.all(
        ((ctx.vtex.route.params.productIds as string) || '')
          .split(',')
          .map((productId) => products.getOrCreateProduct(productId))
      );

      console.info('products', JSON.stringify(productsData));

      await next();
    },
    addNotification: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { events },
        vtex: {
          route: {
            params: { IdSku, DateModified },
          },
        },
      } = ctx;

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      await events.sendEvent('codeby.nosto', 'broadcaster.notification', { IdSku, DateModified });
      await next();
    },
    verifyUpdateOfAllProducts: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { eventSender },
      } = ctx;

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      await eventSender({ eventArgs: verifyUpdateOfAllProducts() });
      await next();
    },
    verifyUpdateOfProduct: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { eventSender },
        vtex: {
          route: {
            params: { productId },
          },
        },
      } = ctx;

      ctx.status = 200;
      ctx.body = 'ok';
      ctx.set('Cache-Control', 'no-cache');

      await eventSender({ eventArgs: verifyUpdateOfProduct(String(productId)) });
      await next();
    },
    eventsWatcher: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { events },
      } = ctx;

      ctx.status = 200;
      ctx.set('Cache-Control', 'no-cache');
      ctx.body = 'ok';

      await events.sendEvent(...nostoWatcher());
      await next();
    },
    test: async (ctx: ServiceContext, next: () => Promise<void>) => {
      const {
        clients: { nostoEvents, events },
        query: { action, limit: qLimit },
      } = ctx;

      ctx.status = 200;
      ctx.set('Cache-Control', 'no-cache');

      let limit = parseInt(String(qLimit), 10);
      if (isNaN(limit)) {
        limit = 1;
      }

      if (action === 'delete') {
        const data = await nostoEvents.getNextEvents(limit, 2147483647);
        ctx.body = JSON.stringify(data.length);

        await parallel({
          data,
          concurrency: 30,
          callback: (event) => nostoEvents.deleteEvent(event.documentId),
        });
      } else if (action === 'add') {
        const ids: number[] = [];
        for (let i = 1; i <= limit; i++) {
          ids.push(i + 1);
        }
        await parallel({
          data: ids,
          concurrency: 30,
          callback: (productId) => nostoEvents.createEvent(sendProductEvent, { productId }, new Date()),
        });
        ctx.body = `${limit} events created!`;
      } else if (action === 'nextCall') {
        const events = await nostoEvents.getNextEvents(1);
        ctx.body = JSON.stringify(events);
        await parallel({
          data: events,
          concurrency: 10,
          callback: (event) => nostoEvents.updateEventNextCall(event.documentId),
        });
      } else if (action === 'retries') {
        const events = await nostoEvents.getNextEvents(1);
        ctx.body = JSON.stringify(events);
        await parallel({
          data: events,
          concurrency: 10,
          callback: (event) => nostoEvents.increaseEventRetries(event.documentId),
        });
      } else if (action === 'watcher') {
        ctx.body = 'ok';
        await events.sendEvent(...nostoWatcher());
      } else if (action === 'count') {
        ctx.body = String(await nostoEvents.getEventsCountFor());
      } else {
        ctx.body = 'no action!';
      }

      await next();
    },
  },
});
