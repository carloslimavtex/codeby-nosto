import { productsCurrentTime } from './products-current-time';

describe('productsCurrentTime', () => {
  it('should decrease current timestamp', () => {
    const timestamp = 123456789;
    jest.spyOn(Date.prototype, 'getTime').mockReturnValueOnce(timestamp);
    expect(productsCurrentTime()).toBeLessThan(timestamp);
  });

  it('should accept a date as argument', () => {
    expect(productsCurrentTime(new Date('2022-08-01T18:46:23.960Z'))).toBe(1659379583);
  });
});
