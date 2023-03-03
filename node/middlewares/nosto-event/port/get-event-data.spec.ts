import { IOContext } from '@vtex/api';
import NostoEvents from '../../../clients/nosto-events';
import generateGetEventData from './get-event-data';
import { NostoEventPort } from '../use-case';

jest.mock('../../../clients/nosto-events');

function createGetEventData() {
  const nostoEvents = new NostoEvents({} as unknown as IOContext);
  return {
    getEventData: generateGetEventData(nostoEvents),
    nostoEvents,
  };
}

describe('generateGetEventData', () => {
  it('should be a function', () => {
    expect(typeof generateGetEventData).toBe('function');
  });
});

describe('getEventData', () => {
  let getEventData: NostoEventPort['getEventData'];
  let nostoEvents: NostoEvents;

  beforeEach(() => {
    ({ getEventData, nostoEvents } = createGetEventData());
  });
  it('should be a function', () => {
    expect(typeof getEventData).toBe('function');
  });

  it('should call nostoEvents getEvent', async () => {
    const id = '123';
    await getEventData(id);
    expect(nostoEvents.getEvent).toHaveBeenCalledWith(id);
  });

  it('should return formatted data if event is found', async () => {
    const id = '123';
    const body = { foo: 'bar' };
    const retries = 123;

    jest.spyOn(nostoEvents, 'getEvent').mockResolvedValue({
      id,
      args: body,
      retries,
      name: 'foo',
      nextCall: 123,
      addToNextCall: undefined,
    });
    const data = await getEventData(id);
    expect(data).toEqual({
      id,
      body,
      retries,
      name: 'foo',
    });
  });

  it('should return undefined if no event is found', () => {
    jest.spyOn(nostoEvents, 'getEvent').mockResolvedValue(null);
    return expect(getEventData('123')).resolves.toBeUndefined();
  });
});
