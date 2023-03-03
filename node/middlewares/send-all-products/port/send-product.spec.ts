import { sendProduct } from '../../../utils/events';
import generateSendProduct from './send-product';

function createData() {
  const eventSender = jest.fn();
  const sendProduct = generateSendProduct(eventSender);
  return {
    sendProduct,
    eventSender,
  };
}

describe('generateSendProduct', () => {
  it('should be a function', () => {
    expect(typeof generateSendProduct).toBe('function');
  });
});

describe('sendProduct', () => {
  it('should be a function', () => {
    expect(typeof createData().sendProduct).toBe('function');
  });

  it('should call event sender', async () => {
    const { sendProduct: sendProductFn, eventSender } = createData();
    const productId = '123';
    await sendProductFn(productId);
    expect(eventSender).toHaveBeenCalledWith({
      eventArgs: sendProduct(productId),
    });
  });
});
