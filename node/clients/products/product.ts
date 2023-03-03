import { VtexCompatabilityError } from './errors';

// maximum number that VTEX accepts on search/scroll APIs
export const MAXIMUM_VTEX_NUMBER = 2 ** 32 / 2 - 1;

export const defaultData = {
  lastScan: 0,
  lastNotification: 0,
  lastUpdate: 0,
  waitingIndexSince: 0,
};

export const productFields = ['lastScan', 'lastNotification', 'lastUpdate', 'waitingIndexSince'] as const;

export type ProductFields = typeof productFields[number];
export type ProductData = Record<ProductFields, number>;
export type ProductDataFromMasterData = Partial<ProductData> & { productId: string; id: string };

export default class Product {
  protected changedData: Partial<ProductData> = {};

  public static fromMasterData(data: ProductDataFromMasterData) {
    if (typeof data.productId !== 'string') {
      throw new Error(`Product.fromMasterData: Missing productId ${JSON.stringify(data)}`);
    }

    if (typeof data.id !== 'string') {
      throw new Error(`Product.fromMasterData: Missing id ${JSON.stringify(data)}`);
    }

    const productId = data.productId;
    const id = data.id;
    const newData: Partial<ProductData> = {};

    for (const field of productFields) {
      if (Object.hasOwnProperty.call(data, field)) {
        const value = data[field];
        if (typeof value === 'number') {
          newData[field] = value;
        }
      }
    }

    return new Product(id, productId, newData);
  }

  protected constructor(
    public readonly id: string,
    public readonly productId: string,
    protected readonly originalData: Partial<ProductData> = {}
  ) {
    for (const key of productFields) {
      if (!Object.hasOwnProperty.call(originalData, key)) {
        this.setTimestampFor(key, 0);
      }
    }
  }

  public get lastScan() {
    return this.timestampFor('lastScan');
  }

  public set lastScan(timestamp: number) {
    this.setTimestampFor('lastScan', timestamp);
  }

  protected timestampFor(key: ProductFields): number {
    const sourceObjects = [this.changedData, this.originalData, defaultData];
    for (const sourceObject of sourceObjects) {
      if (Object.hasOwnProperty.call(sourceObject, key)) {
        const value = sourceObject[key];
        if (typeof value === 'number') {
          return value;
        }
      }
    }
    throw Error(`Product.timestampFor(${key}) should not have reached here!`);
  }

  protected setTimestampFor(key: ProductFields, timestamp: number) {
    this.verifyTimestampLimits(timestamp, key);
    if (this.originalData[key] === timestamp) {
      delete this.changedData[key];
    } else if (this.originalData[key] !== timestamp) {
      this.changedData[key] = timestamp;
    }
  }

  private verifyTimestampLimits(number: number, method: keyof Product): void | never {
    if (number > MAXIMUM_VTEX_NUMBER) {
      throw new VtexCompatabilityError(`Product.${method} surprass VTEX limit of ${MAXIMUM_VTEX_NUMBER}: ${number}`);
    } else if (number < 0) {
      throw new VtexCompatabilityError(`Product.${method} does not accept negative number: ${number}`);
    }
  }

  public get lastNotification() {
    return this.timestampFor('lastNotification');
  }

  public set lastNotification(timestamp: number) {
    this.setTimestampFor('lastNotification', timestamp);
    if (!this.waitingIndexSince) {
      this.updateWaitingIndexSince();
    }
  }

  public get lastUpdate() {
    return this.timestampFor('lastUpdate');
  }

  public set lastUpdate(timestamp: number) {
    if (this.shouldUpdateLastUpdate(timestamp)) {
      this.setTimestampFor('lastUpdate', timestamp);
      this.updateWaitingIndexSince();
    }
  }

  public shouldUpdateLastUpdate(timestamp?: number): boolean {
    return timestamp ? timestamp > this.lastUpdate : false;
  }

  protected updateWaitingIndexSince(): void {
    if (this.lastUpdate > this.lastNotification) {
      this.setTimestampFor('waitingIndexSince', 0);
    } else {
      this.setTimestampFor('waitingIndexSince', this.lastNotification);
    }
  }

  public get waitingIndexSince() {
    return this.timestampFor('waitingIndexSince');
  }

  public needToUpdateData(): boolean {
    for (const [keyName, value] of Object.entries(this.changedData)) {
      const key = keyName as unknown as ProductFields;
      if (this.originalData[key] !== value) {
        return true;
      }
    }
    return false;
  }

  public get dataToUpdate(): Partial<ProductData> {
    const data: Partial<ProductData> = {};

    for (const field of productFields) {
      const value = this.changedData[field];
      if (typeof value === 'number') {
        data[field] = value;
      }
    }

    return data;
  }

  public get isWaitingIndex(): boolean {
    return this.waitingIndexSince > 0;
  }
}
