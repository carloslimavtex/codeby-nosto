import { ParallelCallback } from './interfaces';
import job from './job';

export type ParallelParams<T, R> = {
  data: T[];
  concurrency: number;
  callback: ParallelCallback<T, R>;
};
export default async function parallel<T, R>({ data, concurrency = 1, callback }: ParallelParams<T, R>): Promise<R[]> {
  const sourceData = [...data];
  const response: R[] = [];

  if (concurrency < 1) {
    concurrency = 1;
  }

  const promises: Promise<void>[] = [];

  for (let i = 0; i < concurrency; i++) {
    promises.push(job(sourceData, response, callback));
  }

  await Promise.all(promises);

  return response;
}
