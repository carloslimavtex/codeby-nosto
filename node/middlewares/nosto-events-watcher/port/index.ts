import type { Events } from '@vtex/api';
import type NostoEvents from '../../../clients/nosto-events';
import { NostoEventsWatcherPort } from '../use-case';
import generateEmitEvent from './emit-event';
import generateForEachEvent from './for-each-event';
import { generateUpdateEventNextCall } from './update-event-next-call';

export type NostoEventsWatcherPortParams = {
  events: Events;
  nostoEvents: NostoEvents;
};
export default function nostoEventsWatcherPort({
  events,
  nostoEvents,
}: NostoEventsWatcherPortParams): NostoEventsWatcherPort {
  return {
    emitEvent: generateEmitEvent(events),
    updateEventNextCall: generateUpdateEventNextCall(nostoEvents),
    forEachEvent: generateForEachEvent(nostoEvents),
  };
}
