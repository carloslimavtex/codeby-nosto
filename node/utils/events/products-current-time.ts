import { toTimestamp } from '../vtex-timestamp';

export function productsCurrentTime(date?: Date) {
  const timestamp = toTimestamp(date ?? new Date());
  if (timestamp > 2147483647) {
    throw new Error(
      [
        'events.productsCurrentTime: timestmap exceeds vtex limit of 2147483647.',
        "MasterData search and scroll APIs can't have this number on 'where'",
      ].join(' ')
    );
  }
  return timestamp;
}
