import getNostoEventId from './get-nosto-event-id';

describe('getNostoEventId', () => {
  it('should be a function', () => {
    expect(typeof getNostoEventId).toBe('function');
  });

  it('should return the event id', () => {
    expect(getNostoEventId({ documentId: 'foo' })).toBe('foo');
  });
});
