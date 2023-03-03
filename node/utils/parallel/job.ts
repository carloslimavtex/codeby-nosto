import { ParallelCallback } from './interfaces';

export default async function job<T, R>(
  dataSource: T[],
  dataTarget: R[],
  callback: ParallelCallback<T, R>
): Promise<void> {
  for (;;) {
    const data = dataSource.shift();
    if (!data) {
      break;
    }

    dataTarget.push(await callback(data));
  }
}
