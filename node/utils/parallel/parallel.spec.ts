import job from './job';
import parallel from './parallel';

jest.mock('./job', () => {
  const data = jest.requireActual('./job');
  return jest.fn(data.default);
});

describe('parallel', () => {
  it('should be a function', () => {
    expect(typeof parallel).toBe('function');
  });

  it('should return processed data', async () => {
    const originalData = [5, 6, 7, 8];
    const expectedData = [10, 12, 14, 16].sort();
    const responseData = await parallel({ data: originalData, concurrency: 10, callback: (n) => n * 2 });
    expect(responseData.sort()).toEqual(expectedData);
  });

  it('should call jobs to the concurrency number', async () => {
    await parallel({ data: [], concurrency: 10, callback: jest.fn() });
    expect(job).toHaveBeenCalledTimes(10);
  });

  it('should not change source array', async () => {
    const originalData = [5, 6, 7, 8];
    const copyData = [...originalData];
    await parallel({ data: originalData, concurrency: 10, callback: (n) => n * 2 });
    expect(originalData).toEqual(copyData);
  });
});
