import NostoEventsWatcherUseCase, { NostoEventsWatcherPort, PortEvent } from './use-case';

function fakePort(events?: PortEvent[]): NostoEventsWatcherPort {
  return {
    forEachEvent: jest.fn(async function forEachEvent(cb) {
      for (const event of events ?? []) {
        await cb(event);
      }
    }),
    updateEventNextCall: jest.fn(),
    emitEvent: jest.fn(),
  };
}

async function execute(events?: PortEvent[]) {
  const port = fakePort(events);
  const useCase = new NostoEventsWatcherUseCase(port);
  await useCase.execute();
  return port;
}

const fakeEvents: PortEvent[] = [
  {
    id: '10',
    name: 'foo',
  },
  {
    id: '20',
    name: 'bar',
  },
];

describe('NostoEventsWatcherUseCase', () => {
  it('should be a class', () => {
    expect(typeof NostoEventsWatcherUseCase).toBe('function');
  });

  it('should work', () => {
    return expect(execute(fakeEvents)).resolves.not.toThrowError();
  });

  it('should call forEachEvent', async () => {
    const port = await execute();
    expect(port.forEachEvent).toHaveBeenCalled();
  });

  it('should call updateEventNextCall for each event', async () => {
    const port = await execute(fakeEvents);
    for (const event of fakeEvents) {
      expect(port.updateEventNextCall).toHaveBeenCalledWith(event.id);
    }
  });

  it('should call emitEvent for each event', async () => {
    const port = await execute(fakeEvents);
    for (const event of fakeEvents) {
      expect(port.emitEvent).toHaveBeenCalledWith(event.name, event.id);
    }
  });
});
