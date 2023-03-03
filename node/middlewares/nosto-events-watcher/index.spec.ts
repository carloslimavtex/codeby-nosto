import { Events, IOContext } from '@vtex/api';
import nostoEventsWatcherMiddleware from '.';
import NostoEvents from '../../clients/nosto-events';
import nostoEventsWatcherPort from './port';
import NostoEventsWatcherUseCase from './use-case';

jest.mock('./port');
jest.mock('./use-case');
jest.mock('@vtex/api');
jest.mock('../../clients/nosto-events');

function createContext() {
  return {
    clients: {
      event: new Events({} as unknown as IOContext),
      nostoEvents: new NostoEvents({} as unknown as IOContext),
    },
  } as unknown as Context;
}

describe('nostoEventsWatcherMiddleware', () => {
  it('should be a function', () => {
    expect(typeof nostoEventsWatcherMiddleware).toBe('function');
  });

  it('should create port', async () => {
    await nostoEventsWatcherMiddleware(createContext(), jest.fn());
    expect(nostoEventsWatcherPort).toHaveBeenCalled();
  });

  it('should create use case', async () => {
    await nostoEventsWatcherMiddleware(createContext(), jest.fn());
    const instance = (NostoEventsWatcherUseCase as jest.Mock).mock.instances[0];
    expect(instance).not.toBeUndefined();
  });

  it('should execute use case', async () => {
    await nostoEventsWatcherMiddleware(createContext(), jest.fn());
    const instance = (NostoEventsWatcherUseCase as jest.Mock).mock.instances[0];
    expect(instance.execute).toHaveBeenCalled();
  });
});
