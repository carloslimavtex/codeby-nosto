export interface OrderData {
  orderId: string;
  currentState: string;
  currentChangeDate: string;
}

export default async function orderUpdated(ctx: Context) {
  const {
    clients: { nosto },
    // vtex: { logger },
  } = ctx;

  const { orderId, currentState, currentChangeDate } = ctx.body as OrderData;

  await nosto.updateOrder(orderId, currentState, currentChangeDate);
}
