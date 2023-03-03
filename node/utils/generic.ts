/* eslint-disable @typescript-eslint/no-explicit-any */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R>
  ? R
  : any;

export type AsyncType<T extends Promise<any>> = T extends Promise<infer R> ? R : any;
