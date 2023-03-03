import { Events } from '@vtex/api';
import NostoEvents from '../../clients/nosto-events';
import { EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES } from '../../constants';
import { toTimestamp } from '../vtex-timestamp';
import { toNostoWatcherEvent } from './events';

export type EventSenderParams<Params = unknown> = {
  eventArgs: [string, string, Params];
  nextCall?: number | Date;
  addToNextCall?: number;
  emitEvent?: boolean;
};
export type EventSender = (params: EventSenderParams) => Promise<void>;
export function generateEventSender(events: Events, nostoEvents: NostoEvents): EventSender {
  return async function eventSender({
    eventArgs: [, eventName, eventParams],
    nextCall: originalNextCall,
    addToNextCall,
    emitEvent,
  }: EventSenderParams): Promise<void> {
    const { nextCall, userDefined } = nextCallTime(originalNextCall);

    const documentId = await nostoEvents.createEvent(eventName, eventParams, nextCall, addToNextCall);

    if (shouldSendEvent({ userDefined, emitEvent })) {
      await events.sendEvent(...toNostoWatcherEvent(eventName, documentId));
    }
  };
}

function nextCallTime(originalNextCall?: number | Date) {
  let nextCallTime: number | Date;
  const nowDate = new Date();
  const userDefined = typeof originalNextCall !== 'undefined';

  if (originalNextCall) {
    nextCallTime = originalNextCall;
  } else {
    const date = new Date(nowDate);
    date.setMinutes(date.getMinutes() + EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES);
    nextCallTime = date;
  }

  let nextCall = toTimestamp(nextCallTime);
  const now = toTimestamp(new Date());

  if (nextCall <= now && !userDefined) {
    nextCall = EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES * 60;
  }

  return {
    nextCall,
    userDefined,
  };
}

export type ShouldSendEvent = {
  userDefined: boolean;
  emitEvent?: boolean;
};
function shouldSendEvent({ userDefined, emitEvent }: ShouldSendEvent): boolean {
  if (typeof emitEvent === 'boolean') {
    return emitEvent;
  }

  if (userDefined) {
    return false;
  }

  return true;
}
