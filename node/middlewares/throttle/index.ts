import sleep from '../../utils/sleep';
import { TooManyRequestsError } from '@vtex/api';

export default function throttleGenerator(MAX_REQUEST = 5) {
  let COUNTER = 0;
  return async function throttle(_: Context, next: () => Promise<void>) {
    if (COUNTER >= MAX_REQUEST) {
      const timeToSleep = Math.ceil(Math.random() * 100);
      await sleep(timeToSleep);
      throw new TooManyRequestsError();
    }

    try {
      COUNTER++;
      await next();
    } finally {
      COUNTER--;
    }
  };
}
