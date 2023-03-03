import { IOContext } from '@vtex/api';
import NostoEvents from '../../../clients/nosto-events';
import generateDeleteEvent from './delete-event';
import { NostoEventPort } from '../use-case';

jest.mock('../../../clients/nosto-events');

function createDeleteEvent() {
  const nostoEvents = new NostoEvents({} as unknown as IOContext);
  return {
    deleteEvent: generateDeleteEvent(nostoEvents),
    nostoEvents,
  };
}

describe('generateDeleteEvent', () => {
  it('should be a function', () => {
    expect(typeof generateDeleteEvent).toBe('function');
  });
});

describe('increaseRetries', () => {
  let deleteEvent: NostoEventPort['deleteEvent'];
  let nostoEvents: NostoEvents;

  beforeEach(() => {
    ({ deleteEvent, nostoEvents } = createDeleteEvent());
  });
  it('should be a function', () => {
    expect(typeof deleteEvent).toBe('function');
  });

  it('should call nostoEvents increaseEventRetries', async () => {
    const id = '123';
    await deleteEvent(id);
    expect(nostoEvents.deleteEvent).toHaveBeenCalledWith(id);
  });
});
