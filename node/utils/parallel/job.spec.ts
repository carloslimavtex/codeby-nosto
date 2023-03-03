import job from './job';

describe('job', () => {
  it('should be a function', () => {
    expect(typeof job).toBe('function');
  });

  it('should execute callback for every value', async () => {
    const sourceData = [5, 6, 7, 8];
    const targetData: number[] = [];
    const expectedData = [10, 12, 14, 16];
    await job(sourceData, targetData, (n) => n * 2);
    expect(targetData).toEqual(expectedData);
  });

  describe('should get data from source one at a time', () => {
    it('even if data is removed', async () => {
      const sourceData = [5, 6, 7, 8];
      const targetData: number[] = [];
      const expectedData = [10, 14];
      await job(sourceData, targetData, (n) => {
        sourceData.shift();
        return n * 2;
      });
      expect(targetData).toEqual(expectedData);
    });

    it('even if data is added', async () => {
      const sourceData = [5, 6, 7, 8];
      const targetData: number[] = [];
      const expectedData = [10, 12, 14, 16, 20, 24];
      await job(sourceData, targetData, (n) => {
        if (n < 7) {
          sourceData.push(n * 2);
        }
        return n * 2;
      });
      expect(targetData).toEqual(expectedData);
    });
  });
});
