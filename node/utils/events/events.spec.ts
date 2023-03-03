import {
  verifyAllProductsInVtex,
  verifyProductInVtex,
  sendAllProducts,
  sendProduct,
  verifyUpdateOfAllProducts,
  verifyUpdateOfProduct,
  nostoWatcher,
  toNostoWatcherEvent,
} from './events';

import {
  verifyAllProductsInVtexEvent,
  verifyProductInVtexEvent,
  sendAllProductsEvent,
  sendProductEvent,
  verifyUpdateOfAllProductsEvent,
  verifyUpdateOfProductEvent,
  nostoWatcherEvent,
} from './constants';

import { APP_ID } from '../../constants';

describe('events utils', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should have a verifyAllProductsInVtex event', () => {
    expect(verifyAllProductsInVtex(10, 'foo')).toEqual([
      APP_ID,
      verifyAllProductsInVtexEvent,
      { lastScan: 10, token: 'foo' },
    ]);
  });

  it('should have a verifyProductInVtex event', () => {
    expect(verifyProductInVtex('123')).toEqual([APP_ID, verifyProductInVtexEvent, { productId: '123' }]);
  });

  it('should have a sendAllProducts event', () => {
    expect(sendAllProducts(2, 345)).toEqual([APP_ID, sendAllProductsEvent, { page: 2, lastScan: 345 }]);
  });

  it('should have a sendAllProducts event with optional lastScan', () => {
    jest.useFakeTimers().setSystemTime(new Date(456000));
    expect(sendAllProducts(2)).toEqual([APP_ID, sendAllProductsEvent, { page: 2, lastScan: 456 }]);
  });

  it('should have a sendProduct event', () => {
    expect(sendProduct('123')).toEqual([APP_ID, sendProductEvent, { productId: '123' }]);
  });

  it('should have a verifyUpdateOfAllProducts event', () => {
    expect(verifyUpdateOfAllProducts('foo')).toEqual([APP_ID, verifyUpdateOfAllProductsEvent, { token: 'foo' }]);
  });

  it('should have a verifyUpdateOfProduct event', () => {
    expect(verifyUpdateOfProduct('123')).toEqual([APP_ID, verifyUpdateOfProductEvent, { productId: '123' }]);
  });

  it('should have a nostoWatcher event', () => {
    expect(nostoWatcher()).toEqual([APP_ID, nostoWatcherEvent, {}]);
  });

  it('should create nostoWatcherEvent', () => {
    expect(toNostoWatcherEvent('foo', '123')).toEqual([APP_ID, 'foo', { documentId: '123' }]);
  });
});
