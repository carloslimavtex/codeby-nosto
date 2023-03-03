import NostoEvents from '../../../clients/nosto-events';
import parallel from '../../../utils/parallel';
import { NostoEventsWatcherPort } from '../use-case';

export default function generateForEachEvent(nostoEvents: NostoEvents): NostoEventsWatcherPort['forEachEvent'] {
  return async function forEachEvent(callback) {
    const rawEvents = await nostoEvents.getNextEvents(2000, 2147483647);
    const data = rawEvents.map((event) => ({ id: event.documentId, name: event.eventName }));
    await parallel({
      data,
      concurrency: 20,
      callback,
    });
  };
}
