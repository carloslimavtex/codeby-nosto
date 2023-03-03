import { Events, IOContext } from '@vtex/api';
import NostoEvents from '../../clients/nosto-events';
import { APP_ID } from '../../constants';
import { toTimestamp } from '../vtex-timestamp';
import { EventSender, EventSenderParams, generateEventSender } from './event-sender';

jest.mock('@vtex/api');
jest.mock('../../clients/nosto-events');
jest.mock('../vtex-timestamp');

function createEvents() {
  return new Events({} as unknown as IOContext);
}

function createNostoEvents() {
  return new NostoEvents({} as unknown as IOContext);
}

function createEventSender() {
  const events = createEvents();
  const nostoEvents = createNostoEvents();
  const eventSender = generateEventSender(events, nostoEvents);
  return {
    eventSender,
    events,
    nostoEvents,
  };
}

describe('generateEventSender', () => {
  it('should be a function', () => {
    expect(typeof generateEventSender).toBe('function');
  });
});

describe('eventSender', () => {
  let eventSender: EventSender;
  let sendEvent: jest.Mock;
  let createEvent: jest.Mock;
  const toTimestampMock = toTimestamp as unknown as jest.Mock;
  const eventApp = APP_ID;
  const eventName = 'teste';
  const eventParams = { foo: 'bar' };
  const eventArgs: EventSenderParams['eventArgs'] = [eventApp, eventName, eventParams];

  beforeEach(() => {
    ({
      eventSender,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      events: { sendEvent },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      nostoEvents: { createEvent },
    } = createEventSender());
    sendEvent.mockResolvedValue(null);
  });

  it('should be a function', () => {
    expect(typeof eventSender).toBe('function');
  });

  it('should pass a date by default to toTimestamp', async () => {
    await eventSender({ eventArgs });
    expect(toTimestamp).toHaveBeenCalled();
    expect(toTimestampMock.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('should pass nextCall to toTimestamp', async () => {
    const nextCall = new Date();
    await eventSender({ eventArgs, nextCall });
    expect(toTimestamp).toHaveBeenCalledWith(nextCall);
  });

  it('should create a nosto event with event data', async () => {
    const nextCall = 1234;
    toTimestampMock.mockReturnValueOnce(nextCall);
    await eventSender({ eventArgs });
    expect(createEvent).toHaveBeenCalledWith(eventName, eventParams, nextCall, undefined);
  });

  it('should send event if timestamp is not in future', async () => {
    toTimestampMock.mockReturnValue(10);
    await eventSender({ eventArgs });
    expect(sendEvent).toHaveBeenCalled();
  });

  it('should not send event if timestamp is in the future', async () => {
    // nextCall
    toTimestampMock.mockReturnValueOnce(11);
    // now
    toTimestampMock.mockReturnValueOnce(10);
    await eventSender({ eventArgs, nextCall: 11 });
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('should not send event if emitEvent is false', async () => {
    toTimestampMock.mockReturnValue(10);
    await eventSender({ eventArgs, emitEvent: false });
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('should send event if emitEvent is true', async () => {
    // nextCall
    toTimestampMock.mockReturnValueOnce(11);
    // now
    toTimestampMock.mockReturnValueOnce(10);
    await eventSender({ eventArgs, emitEvent: true, nextCall: 11 });
    expect(sendEvent).toHaveBeenCalled();
  });

  it('should not send event if nextCall is user defined and emitEvent is undefined', async () => {
    toTimestampMock.mockReturnValue(10);
    await eventSender({ eventArgs, nextCall: 10 });
    expect(sendEvent).not.toHaveBeenCalled();
  });

  it('should send event with event document id as param', async () => {
    const documentId = '123';
    toTimestampMock.mockReturnValue(10);
    createEvent.mockResolvedValue(documentId);
    await eventSender({ eventArgs });
    expect(sendEvent).toHaveBeenCalledWith(eventApp, eventName, { documentId });
  });

  it('should pass addToNextCall', async () => {
    const nextCall = 1234;
    const addToNextCall = 10;
    toTimestampMock.mockReturnValueOnce(nextCall);
    await eventSender({ eventArgs, addToNextCall });
    expect(createEvent).toHaveBeenCalledWith(eventName, eventParams, nextCall, addToNextCall);
  });
});
