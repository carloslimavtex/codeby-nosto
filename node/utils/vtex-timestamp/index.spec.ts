import { MAXIMUM_VTEX_NUMBER, toTimestamp } from '.';

describe('vtexTimestamp', () => {
  it('should be a function', () => {
    expect(typeof toTimestamp).toBe('function');
  });

  it('should return the number when it is below the maximum', () => {
    const numbers = [0, 1, 123456789, MAXIMUM_VTEX_NUMBER];
    for (const number of numbers) {
      expect(toTimestamp(number)).toBe(number);
    }
  });

  it('should transform float into integer', () => {
    expect(toTimestamp(10.9)).toBe(10);
  });

  it('should return floor(number / 1000) when it is greater than maximum', () => {
    const numbers = [
      MAXIMUM_VTEX_NUMBER + 1,
      MAXIMUM_VTEX_NUMBER * 2,
      MAXIMUM_VTEX_NUMBER * 100,
      MAXIMUM_VTEX_NUMBER * 1000,
    ];

    for (const number of numbers) {
      expect(toTimestamp(number)).toBe(Math.floor(number / 1000));
    }
  });

  it('should throw if the decreased number is still too large', () => {
    // against floor(n / 1000)
    const number = MAXIMUM_VTEX_NUMBER * 1000 + 1000;
    expect(() => toTimestamp(number)).toThrowError(String(number));
  });

  it('should throw if the number is negative', () => {
    expect(() => toTimestamp(-1)).toThrowError(String('-1'));
  });

  it('should accept dates', () => {
    const number = MAXIMUM_VTEX_NUMBER * 500;
    const expectedNumber = Math.floor(number / 1000);
    const date = new Date();
    const getTime = jest.spyOn(date, 'getTime').mockImplementation(() => number);
    expect(toTimestamp(date)).toBe(expectedNumber);
    expect(getTime).toHaveBeenCalled();
  });
});
