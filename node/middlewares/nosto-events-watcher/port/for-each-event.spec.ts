import type { IOContext } from '@vtex/api';
import NostoEvents from '../../../clients/nosto-events';
import { NostoEventsWatcherPort } from '../use-case';
import generateForEachEvent from './for-each-event';

jest.mock('../../../clients/nosto-events');

function createNostoEvents() {
  return new NostoEvents({} as unknown as IOContext);
}

function createForEachEvent(nostoEvents?: NostoEvents) {
  return generateForEachEvent(nostoEvents ?? createNostoEvents());
}

describe('generateForEachEvent', () => {
  it('should be a function', () => {
    expect(typeof generateForEachEvent).toBe('function');
  });
});

describe('forEachEvent', () => {
  let forEachEvent: NostoEventsWatcherPort['forEachEvent'];
  let nostoEvents: NostoEvents;

  beforeEach(() => {
    nostoEvents = createNostoEvents();
    forEachEvent = createForEachEvent(nostoEvents);
  });
  it('should be a function', () => {
    expect(typeof forEachEvent).toBe('function');
  });

  it('should call getNextEvents', async () => {
    const mock = jest.spyOn(nostoEvents, 'getNextEvents').mockResolvedValue([]);
    await forEachEvent(jest.fn());
    expect(mock).toHaveBeenCalled();
  });

  it('should call callback for each event', async () => {
    const rawEvents = [
      {
        documentId: '123',
        eventName: 'foo',
      },
      {
        documentId: '456',
        eventName: 'bar',
      },
    ];
    const events = rawEvents.map((event) => ({ id: event.documentId, name: event.eventName }));
    const callback = jest.fn();

    jest.spyOn(nostoEvents, 'getNextEvents').mockResolvedValue(rawEvents);

    await forEachEvent(callback);

    for (const event of events) {
      expect(callback).toHaveBeenCalledWith(event);
    }
  });
});
