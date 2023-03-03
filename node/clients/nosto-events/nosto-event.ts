export type NostoEvent<T = unknown> = {
  id: string;
  name: string;
  args: T;
  nextCall: number;
  addToNextCall: number | undefined;
  retries: number;
};
