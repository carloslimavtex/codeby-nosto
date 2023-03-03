import pagination, { PaginationData } from './pagination';

function page(pageNumber: number, perPage: number, count: number): PaginationData {
  return {
    page: pageNumber,
    perPage,
    count,
  };
}

describe('pagination', () => {
  it('should be a function', () => {
    expect(typeof pagination).toBe('function');
  });

  it('should return a page', () => {
    expect(pagination(10, 10)).toEqual([page(1, 10, 10)]);
  });

  it('should return smaller count', () => {
    expect(pagination(5, 10)).toEqual([page(1, 10, 5)]);
  });

  it('should return multiple pages', () => {
    expect(pagination(10, 5)).toEqual([page(1, 5, 5), page(2, 5, 5)]);
  });

  it('should return smaller count on multiple pages', () => {
    expect(pagination(9, 5)).toEqual([page(1, 5, 5), page(2, 5, 4)]);
  });

  it('should work with a gigantic number of pages', () => {
    const pages = pagination(5678, 100);
    expect(pages.length).toBe(57);
    expect(pages[pages.length - 1]).toEqual(page(57, 100, 78));
  });
});
