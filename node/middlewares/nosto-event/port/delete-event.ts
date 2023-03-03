import NostoEvents from '../../../clients/nosto-events';
import { NostoEventPort } from '../use-case';

export default function generateDeleteEvent(nostoEvents: NostoEvents): NostoEventPort['deleteEvent'] {
  return function deleteEvent(eventId: string) {
    return nostoEvents.deleteEvent(eventId);
  };
}
