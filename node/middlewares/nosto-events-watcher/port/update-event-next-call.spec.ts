import type { IOContext } from '@vtex/api';
import NostoEvents from '../../../clients/nosto-events';
import { generateUpdateEventNextCall } from './update-event-next-call';

jest.mock('../../../clients/nosto-events');

function createNostoEvents() {
  return new NostoEvents({} as unknown as IOContext);
}

function createUpdateEventNextCall(nostoEvents?: NostoEvents) {
  return generateUpdateEventNextCall(nostoEvents ?? createNostoEvents());
}

describe('generateUpdateEventNextCall', () => {
  it('should be a function', () => {
    expect(typeof generateUpdateEventNextCall).toBe('function');
  });
});

describe('updateEventNextCall', () => {
  it('should be a function', () => {
    expect(typeof createUpdateEventNextCall()).toBe('function');
  });

  it('should call updateEventNextCall', async () => {
    const nostoEvents = createNostoEvents();
    const updateEventNextCall = createUpdateEventNextCall(nostoEvents);
    await updateEventNextCall('123');
    expect(nostoEvents.updateEventNextCall).toHaveBeenCalledWith('123');
  });
});
