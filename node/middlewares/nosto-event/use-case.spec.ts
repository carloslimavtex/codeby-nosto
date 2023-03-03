import { TooManyRequestsError, UserInputError } from '@vtex/api';
import NostoEventUseCase, { NostoEventPort } from './use-case';

const globalDocumentId = '123';
const maxRetries = 3;
const globalEventData = { id: 'event-id', body: { foo: 'bar' }, retries: 1 };

function createEmptyPort(): NostoEventPort<{ foo: string }> {
  return {
    body: { documentId: globalDocumentId },
    maxRetries,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getNostoEventId: jest.fn((body: any) => body.documentId),
    getEventData: jest.fn().mockResolvedValue(globalEventData),
    executeEventWithBody: jest.fn(),
    increaseRetries: jest.fn(),
    deleteEvent: jest.fn(),
  };
}

type CreateUseCaseParams = {
  beforeUseCase?: (port: NostoEventPort) => void | Promise<void>;
};
async function createUseCase(params?: CreateUseCaseParams) {
  const { beforeUseCase } = params ?? {};
  const port = createEmptyPort();

  if (beforeUseCase) {
    await beforeUseCase(port);
  }

  const useCase = new NostoEventUseCase(port);

  await useCase.execute();

  return {
    useCase,
    port,
  };
}

describe('NostoEventUseCase', () => {
  it('should be a class', () => {
    expect(typeof NostoEventUseCase).toBe('function');
  });

  it('should work', async () => {
    return expect(createUseCase()).resolves.not.toThrow();
  });

  it('should throw if body is incompatible', () => {
    const promise = createUseCase({
      beforeUseCase(port) {
        jest.spyOn(port, 'getNostoEventId').mockReturnValue(null);
      },
    });
    return expect(promise).rejects.toThrowError(UserInputError);
  });

  it('should get event data', async () => {
    const { port } = await createUseCase({
      beforeUseCase(port) {
        jest.spyOn(port, 'getEventData').mockResolvedValue({ id: '123', body: null, retries: 1, name: 'foo' });
      },
    });

    expect(port.getEventData).toHaveBeenCalledWith(globalDocumentId);
  });

  it('should call executeEventWithBody', async () => {
    const { port } = await createUseCase();
    expect(port.executeEventWithBody).toHaveBeenCalled();
  });

  it('should not call executeEventWithBody if there is no body', async () => {
    const { port } = await createUseCase({
      beforeUseCase(port) {
        jest.spyOn(port, 'getEventData').mockResolvedValue(undefined);
      },
    });
    expect(port.executeEventWithBody).not.toHaveBeenCalled();
  });

  it('should throw if executeEventWithBody throws a TooManyRequestError', () => {
    const promise = createUseCase({
      beforeUseCase(port) {
        jest.spyOn(port, 'executeEventWithBody').mockRejectedValue(new TooManyRequestsError('foo'));
      },
    });

    return expect(promise).rejects.toThrowError(TooManyRequestsError);
  });

  describe('when executeEventWithBody throws an error', () => {
    it('should call increaseRetries event retries is smaller than maxRetries', async () => {
      const { port } = await createUseCase({
        beforeUseCase(port) {
          jest.spyOn(port, 'executeEventWithBody').mockRejectedValue(new Error('foo'));
        },
      });

      expect(port.increaseRetries).toHaveBeenCalledWith(globalEventData.id);
    });

    // eslint-disable-next-line max-len
    it('should call deleteEvent if event retries is equal or greater than maxRetries', async () => {
      const { port } = await createUseCase({
        beforeUseCase(port) {
          jest.spyOn(port, 'executeEventWithBody').mockRejectedValue(new Error('foo'));
          jest.spyOn(port, 'getEventData').mockResolvedValue({ ...globalEventData, retries: maxRetries, name: 'foo' });
        },
      });

      expect(port.deleteEvent).toHaveBeenCalledWith(globalEventData.id);
    });
  });

  it('should call deleteEvent after executing without errors', async () => {
    const { port } = await createUseCase();
    expect(port.deleteEvent).toHaveBeenCalledWith(globalEventData.id);
  });
});
