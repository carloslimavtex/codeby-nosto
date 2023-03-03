export type PaginationData = {
  page: number;
  perPage: number;
  count: number;
};
export default function pagination(limit: number, perPage: number): PaginationData[] | PaginationData[] {
  const response: PaginationData[] = [];

  for (let page = 1, i = 0; i < limit; i += perPage, page++) {
    const count = Math.min(perPage, limit - i);
    response.push({
      page,
      perPage,
      count,
    });
  }

  return response;
}
