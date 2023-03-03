import { consoleInfo, consoleWarn } from '../../utils/console';

export type PortVtexProduct = Record<string, unknown>;
export type PortNostoData = { productId: string } & Record<string, unknown>;
export type SendProductPort = {
  productId: string;
  getVtexProduct(): Promise<PortVtexProduct | undefined>;
  vtexProductToNostoData(product: PortVtexProduct): PortNostoData;
  hasNostoProduct(): Promise<boolean>;
  sendNewProduct(product: PortNostoData): Promise<boolean>;
  sendUpdateProduct(product: PortNostoData): Promise<boolean>;
};

export class SendProductUseCase {
  constructor(protected readonly port: SendProductPort) {}

  async execute(): Promise<void> {
    const { getVtexProduct, vtexProductToNostoData, hasNostoProduct, sendNewProduct, sendUpdateProduct } = this.port;

    const product = await getVtexProduct();

    if (!product) {
      return;
    }

    const data = vtexProductToNostoData(product);

    const hasProduct = await hasNostoProduct();

    let result: boolean;
    if (hasProduct) {
      consoleInfo('sendProduct middleware. Updating Nosto Product. ProcuctID:', data.productId);
      result = await sendUpdateProduct(data);
    } else {
      consoleInfo('sendProduct middleware. Creating Nosto Product. ProcuctID:', data.productId);
      result = await sendNewProduct(data);
    }

    if (!result) {
      consoleWarn('sendProduct middleware. Failure in sending product', data.productId);
    }
  }
}
