import NostoEvents from '../../../clients/nosto-events';
import { EventData, NostoEventPort } from '../use-case';

export default function generateGetEventData<Body = unknown>(
  nostoEvents: NostoEvents
): NostoEventPort<Body>['getEventData'] {
  return async function getEventData(eventId: string): Promise<EventData<Body> | undefined> {
    const event = await nostoEvents.getEvent<Body>(eventId);
    if (!event) {
      return undefined;
    }

    return {
      id: event.id,
      body: event.args,
      retries: event.retries,
      name: event.name,
    };
  };
}
