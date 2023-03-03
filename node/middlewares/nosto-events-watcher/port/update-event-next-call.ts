import NostoEvents from '../../../clients/nosto-events';
import { NostoEventsWatcherPort } from '../use-case';

export function generateUpdateEventNextCall(nostoEvents: NostoEvents): NostoEventsWatcherPort['updateEventNextCall'] {
  return async function updateEventNextCall(eventId: string) {
    await nostoEvents.updateEventNextCall(eventId);
  };
}
