import { Events, IOContext } from '@vtex/api';
import { toNostoWatcherEvent } from '../../../utils/events';
import generateEmitEvent from './emit-event';

jest.mock('@vtex/api');

function createEvents() {
  return new Events({} as unknown as IOContext);
}

function createEmitEvent(events?: Events) {
  return generateEmitEvent(events ?? createEvents());
}

describe('generateEmitEvent', () => {
  it('should be a function', () => {
    expect(typeof generateEmitEvent).toBe('function');
  });
});

describe('emitEvent', () => {
  it('should be a function', () => {
    expect(typeof createEmitEvent()).toBe('function');
  });

  it('should call sendEvent', async () => {
    const events = createEvents();
    const emitEvent = createEmitEvent(events);
    await emitEvent('foo', '123');
    expect(events.sendEvent).toHaveBeenCalledWith(...toNostoWatcherEvent('foo', '123'));
  });
});
