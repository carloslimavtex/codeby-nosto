import { IOContext } from '@vtex/api';
import NostoEvents from '../../../clients/nosto-events';
import generateIncreaseRetries from './increase-retries';
import { NostoEventPort } from '../use-case';

jest.mock('../../../clients/nosto-events');

function createIncreaseRetries() {
  const nostoEvents = new NostoEvents({} as unknown as IOContext);
  return {
    increaseRetries: generateIncreaseRetries(nostoEvents),
    nostoEvents,
  };
}

describe('generateIncreaseRetries', () => {
  it('should be a function', () => {
    expect(typeof generateIncreaseRetries).toBe('function');
  });
});

describe('increaseRetries', () => {
  let increaseRetries: NostoEventPort['increaseRetries'];
  let nostoEvents: NostoEvents;

  beforeEach(() => {
    ({ increaseRetries, nostoEvents } = createIncreaseRetries());
  });
  it('should be a function', () => {
    expect(typeof increaseRetries).toBe('function');
  });

  it('should call nostoEvents increaseEventRetries', async () => {
    const id = '123';
    await increaseRetries(id);
    expect(nostoEvents.increaseEventRetries).toHaveBeenCalledWith(id);
  });
});
