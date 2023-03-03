export const MAXIMUM_VTEX_NUMBER = 2 ** 32 / 2 - 1;

// VTEX masterdata only accept a 32-bit signed integer for integer numbers
// (well, it accept bigger numbers but it won't be able to search it).
// Javascript timestamps are bigger than this then we need to decrease its size
export function toTimestamp(originalTimestamp: number | Date): number {
  let timestamp = originalTimestamp;

  if (timestamp instanceof Date) {
    timestamp = timestamp.getTime() / 1000;
  }

  if (timestamp > MAXIMUM_VTEX_NUMBER) {
    timestamp = timestamp / 1000;
  }

  timestamp = Math.floor(timestamp);

  if (timestamp > MAXIMUM_VTEX_NUMBER || timestamp < 0) {
    throw new Error(`VtexTimestamp: Can't use timestamp "${timestamp}". Original timestamp: "${originalTimestamp}"`);
  }

  return timestamp;
}
