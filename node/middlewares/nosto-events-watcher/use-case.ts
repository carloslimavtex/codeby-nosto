export type PortEvent = {
  id: string;
  name: string;
};
export type PortEventCallback = (event: PortEvent) => Promise<void>;
export type NostoEventsWatcherPort = {
  forEachEvent(callback: PortEventCallback): Promise<void>;
  updateEventNextCall(eventId: string): Promise<void>;
  emitEvent(eventName: string, eventId: string): Promise<void>;
};
export default class NostoEventsWatcherUseCase {
  constructor(protected readonly port: NostoEventsWatcherPort) {}

  async execute(): Promise<void> {
    const { forEachEvent, updateEventNextCall, emitEvent } = this.port;

    await forEachEvent(async (event) => {
      await updateEventNextCall(event.id);
      await emitEvent(event.name, event.id);
    });
  }
}
