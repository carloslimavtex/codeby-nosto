import { Events } from '@vtex/api';
import { toNostoWatcherEvent } from '../../../utils/events';
import { NostoEventsWatcherPort } from '../use-case';

export default function generateEmitEvent(events: Events): NostoEventsWatcherPort['emitEvent'] {
  return async function emitEvent(eventName: string, eventId: string) {
    await events.sendEvent(...toNostoWatcherEvent(eventName, eventId));
  };
}
