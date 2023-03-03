import toNostoEvent from './to-nosto-event';
import { NostoEvent } from './nosto-event';

const data: NostoEvent<string> = {
  id: '123',
  name: 'foo',
  args: '{ "a": 1 }',
  nextCall: 12345,
  addToNextCall: undefined,
  retries: 0,
};

const expectedData: NostoEvent<{ a: 1 }> = {
  ...data,
  args: { a: 1 },
};

describe('isNostoEvent', () => {
  it('should be a function', () => {
    expect(typeof toNostoEvent).toBe('function');
  });

  it('should work', () => {
    expect(toNostoEvent(data)).toEqual(expectedData);
  });

  it('should require id', () => {
    expect(toNostoEvent({ ...data, id: undefined })).toBe(null);
  });

  it('should reject empty id', () => {
    expect(toNostoEvent({ ...data, id: '' })).toBe(null);
  });

  it('should require name', () => {
    expect(toNostoEvent({ ...data, name: undefined })).toBe(null);
  });

  it('should reject empty name', () => {
    expect(toNostoEvent({ ...data, name: '' })).toBe(null);
  });

  it('should require nextCall', () => {
    expect(toNostoEvent({ ...data, nextCall: undefined })).toBe(null);
  });

  it('should accept nextCall as 0', () => {
    expect(toNostoEvent({ ...data, nextCall: 0 })).toEqual({ ...expectedData, nextCall: 0 });
  });

  it('should reject nextCall as negative', () => {
    expect(toNostoEvent({ ...data, nextCall: -1 })).toBe(null);
  });

  it('should require retries', () => {
    expect(toNostoEvent({ ...data, retries: undefined })).toBe(null);
  });

  it('should accept retries as 0', () => {
    expect(toNostoEvent({ ...data, retries: 0 })).toEqual({ ...expectedData, retries: 0 });
  });

  it('should reject retries as negative', () => {
    expect(toNostoEvent({ ...data, retries: -1 })).toBe(null);
  });

  it('should parse args as json string', () => {
    expect(toNostoEvent({ ...data, args: '{ "foo": "bar"}' })).toEqual({ ...expectedData, args: { foo: 'bar' } });
  });

  it('should accept args as object', () => {
    expect(toNostoEvent({ ...data, args: { foo: 'bar' } })).toEqual({ ...expectedData, args: { foo: 'bar' } });
  });

  it('should reject args when not object nor string', () => {
    expect(toNostoEvent({ ...data, args: null })).toBe(null);
  });

  it('should reject args when it is array', () => {
    expect(toNostoEvent({ ...data, args: [10] })).toBe(null);
  });

  it('should reject if json string is invalid', () => {
    expect(toNostoEvent({ ...data, args: '{ foo: "bar" }' })).toBe(null);
  });
});
