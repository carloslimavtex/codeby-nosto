export function shouldWaitForIndex(lastNotification: number, lastUpdate: number): boolean {
  return lastNotification > lastUpdate;
}
