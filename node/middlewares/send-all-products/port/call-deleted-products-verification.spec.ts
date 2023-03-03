import { verifyAllProductsInVtex } from '../../../utils/events';
import generateCallDeletedProductsVerification from './call-deleted-products-verification';

function createCall(lastScan = 123) {
  const eventSender = jest.fn();
  const callDeletedProductsVerification = generateCallDeletedProductsVerification(eventSender, lastScan);
  return {
    eventSender,
    callDeletedProductsVerification,
  };
}

describe('generateCallDeletedProductsVerification', () => {
  it('should be a function', () => {
    expect(typeof generateCallDeletedProductsVerification).toBe('function');
  });
});

describe('callDeletedProductsVerification', () => {
  it('should be a function', () => {
    expect(typeof createCall().callDeletedProductsVerification).toBe('function');
  });

  it('should call event sender', async () => {
    const { callDeletedProductsVerification, eventSender } = createCall();
    await callDeletedProductsVerification();
    expect(eventSender).toHaveBeenCalled();
  });

  it('should call event sender with correct event', async () => {
    const lastScan = 123;
    const { callDeletedProductsVerification, eventSender } = createCall(lastScan);

    await callDeletedProductsVerification();

    expect(eventSender).toHaveBeenCalledWith(
      expect.objectContaining({
        eventArgs: verifyAllProductsInVtex(lastScan),
      })
    );
  });

  it('should call event sender with future nextCall', async () => {
    expect.assertions(2);

    const { callDeletedProductsVerification, eventSender } = createCall();

    eventSender.mockImplementation(({ nextCall }) => {
      expect(nextCall).toBeInstanceOf(Date);
      expect(nextCall.getTime()).toBeGreaterThan(new Date().getTime());
    });

    await callDeletedProductsVerification();
  });

  it('should call event sender with emitEvent as false', async () => {
    const { callDeletedProductsVerification, eventSender } = createCall();

    await callDeletedProductsVerification();

    expect(eventSender).toHaveBeenCalledWith(
      expect.objectContaining({
        emitEvent: false,
      })
    );
  });
});
