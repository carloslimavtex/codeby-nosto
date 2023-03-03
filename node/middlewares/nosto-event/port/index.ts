import type NostoEvents from '../../../clients/nosto-events';
import { NostoEventPort } from '../use-case';
import generateDeleteEvent from './delete-event';
import generateGetEventData from './get-event-data';
import getNostoEventId from './get-nosto-event-id';
import generateIncreaseRetries from './increase-retries';

export type NostoEventPortParams<Body> = {
  body: unknown;
  maxRetries?: number;
  nostoEvents: NostoEvents;
  executeEventWithBody: (body: Body) => Promise<void>;
};
export default function nostoEventPort<Body = unknown>({
  body,
  maxRetries = 3,
  nostoEvents,
  executeEventWithBody,
}: NostoEventPortParams<Body>): NostoEventPort<Body> {
  return {
    body,
    maxRetries,
    getNostoEventId,
    getEventData: generateGetEventData<Body>(nostoEvents),
    increaseRetries: generateIncreaseRetries(nostoEvents),
    deleteEvent: generateDeleteEvent(nostoEvents),
    executeEventWithBody,
  };
}
