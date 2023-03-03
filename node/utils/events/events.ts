import { APP_ID } from '../../constants';
import {
  verifyAllProductsInVtexEvent,
  verifyProductInVtexEvent,
  verifyUpdateOfAllProductsEvent,
  verifyUpdateOfProductEvent,
  sendAllProductsEvent,
  sendProductEvent,
  nostoWatcherEvent,
} from './constants';
import { productsCurrentTime } from './products-current-time';

type EventEmitterData<Params = unknown> = [string, string, Params];

export interface VerifyAllProductsInVtexData {
  token?: string;
  lastScan: number;
}
export function verifyAllProductsInVtex(
  lastScan: number,
  token?: string
): EventEmitterData<VerifyAllProductsInVtexData> {
  return [APP_ID, verifyAllProductsInVtexEvent, { lastScan, token }];
}

export interface VerifyProductInVtexData {
  productId: string;
}
export function verifyProductInVtex(productId: string): EventEmitterData<VerifyProductInVtexData> {
  return [APP_ID, verifyProductInVtexEvent, { productId }];
}

export interface SendAllProductsData {
  page: number;
  lastScan: number;
}
export function sendAllProducts(page: number, lastScan?: number): EventEmitterData<SendAllProductsData> {
  // VTEX does not accept a number larger than 2147483647 on search and scroll
  return [APP_ID, sendAllProductsEvent, { page, lastScan: lastScan ?? productsCurrentTime() }];
}

export interface SendProductData {
  productId: string;
}
export function sendProduct(productId: string): EventEmitterData<SendProductData> {
  return [APP_ID, sendProductEvent, { productId }];
}

export interface VerifyUpdateOfAllProductsData {
  token?: string;
}
export function verifyUpdateOfAllProducts(token?: string): EventEmitterData<VerifyUpdateOfAllProductsData> {
  return [APP_ID, verifyUpdateOfAllProductsEvent, { token }];
}

export interface VerifyUpdateOfProductData {
  productId: string;
}
export function verifyUpdateOfProduct(productId: string): EventEmitterData<VerifyUpdateOfProductData> {
  return [APP_ID, verifyUpdateOfProductEvent, { productId }];
}

export function nostoWatcher(): EventEmitterData {
  return [APP_ID, nostoWatcherEvent, {}];
}
export interface NostoWatcherEvent {
  documentId: string;
}
export function toNostoWatcherEvent(eventName: string, documentId: string): EventEmitterData<NostoWatcherEvent> {
  return [APP_ID, eventName, { documentId }];
}
