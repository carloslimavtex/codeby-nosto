import { NostoEvent } from './nosto-event';

// IMPURE FUNCTION!!
// It will parse args
export default function toNostoEvent<T>(data: unknown): NostoEvent<T> | null {
  if (typeof data !== 'object' || !data) {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (!hasAttr(record, 'id', 'string')) {
    return null;
  }

  if (!hasAttr(record, 'name', 'string')) {
    return null;
  }

  if (!hasAttr(record, 'nextCall', 'number')) {
    return null;
  }

  if (!hasAttr(record, 'retries', 'number')) {
    return null;
  }

  let argsData: unknown = record.args;

  if (hasAttr(record, 'args', 'string')) {
    try {
      const args = JSON.parse(record.args as string);
      argsData = args;
    } catch (e) {
      return null;
    }
  }

  if (typeof argsData !== 'object' || argsData === null || Array.isArray(argsData)) {
    return null;
  }

  return {
    id: record.id,
    args: argsData,
    name: record.name,
    nextCall: record.nextCall,
    retries: record.retries,
  } as unknown as NostoEvent<T>;
}

function hasAttr(record: Record<string, unknown>, attr: string, type?: string): boolean {
  if (['undefined', 'null'].includes(typeof record[attr])) {
    return false;
  }

  if (type) {
    const value = record[attr];
    if (typeof value !== type) {
      return false;
    }

    if (type === 'string') {
      if (!value) {
        return false;
      }
    }

    if (type === 'number') {
      if ((value as number) < 0) {
        return false;
      }
    }
  }

  return true;
}
