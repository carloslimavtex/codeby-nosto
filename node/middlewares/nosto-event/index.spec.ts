import { IOContext } from '@vtex/api';
import nostoEventMiddleware from '.';
import NostoEvents from '../../clients/nosto-events';
import generateExecuteEventWithBody from './middleware/execute-event-with-body';
import NostoEventUseCase from './use-case';

jest.mock('./use-case');
jest.mock('../../clients/nosto-events');
jest.mock('./middleware/execute-event-with-body');

function fakeContext() {
  return {
    clients: {
      nostoEvents: new NostoEvents({} as unknown as IOContext),
    },
    body: {
      documentId: '123',
    },
  } as Context;
}

describe('nostoEventMiddleware', () => {
  it('should be a function', () => {
    expect(typeof nostoEventMiddleware).toBe('function');
  });

  it('should call generateExecuteEventWithBody', async () => {
    await nostoEventMiddleware(fakeContext(), jest.fn());
    expect(generateExecuteEventWithBody).toHaveBeenCalled();
  });

  it('should create a NostoEventUseCase', async () => {
    await nostoEventMiddleware(fakeContext(), jest.fn());
    const instance = (NostoEventUseCase as jest.Mock).mock.instances[0];
    expect(instance).not.toBeUndefined();
  });

  it('should call execute of NostoEventUseCase', async () => {
    await nostoEventMiddleware(fakeContext(), jest.fn());
    const instance = (NostoEventUseCase as jest.Mock).mock.instances[0];
    expect(instance.execute).toHaveBeenCalled();
  });
});
