/* eslint-disable @typescript-eslint/no-explicit-any */
import { LINKED } from '@vtex/api';

function generateConsoleFunction(method: keyof typeof console) {
  return function consoleMethod(...args: any[]) {
    if (LINKED) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console[method](...args);
    }
  };
}

export const consoleInfo = generateConsoleFunction('info');
export const consoleWarn = generateConsoleFunction('warn');
export const consoleError = generateConsoleFunction('error');
