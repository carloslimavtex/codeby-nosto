/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TooManyRequestsError, UserInputError } from '@vtex/api';
import { consoleInfo } from '../../utils/console';

export type EventData<Body = unknown> = {
  id: string;
  body: Body;
  name: string;
  retries: number;
};
export type NostoEventPort<Body = unknown> = {
  body: unknown;
  maxRetries: number;
  getNostoEventId(body: unknown): string | null;
  getEventData(eventId: string): Promise<EventData<Body> | undefined>;
  executeEventWithBody(body: unknown): Promise<void>;
  increaseRetries(eventId: string): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
};
export default class NostoEventUseCase<Body = unknown> {
  protected eventId: string;
  protected eventData: EventData<Body> | undefined;
  constructor(private readonly port: NostoEventPort<Body>) {
    const { body, getNostoEventId } = this.port;

    const eventId = getNostoEventId(body);

    if (!eventId) {
      this.incompatibleBody();
    }

    this.eventId = eventId;
  }

  async execute(): Promise<void> {
    const { getEventData } = this.port;

    this.eventData = await getEventData(this.eventId);

    if (this.eventData) {
      await this.executeEvent(this.eventData.body);
    }
  }

  protected incompatibleBody(): never {
    throw new UserInputError(`Body is incompatible with nosto event!`);
  }

  protected async executeEvent(body: Body): Promise<void> {
    const { executeEventWithBody, deleteEvent } = this.port;
    try {
      consoleInfo(`Event ${this.eventData!.name} with body "${JSON.stringify(body)}"`);
      await executeEventWithBody(body);
      await deleteEvent(this.eventData!.id);
    } catch (e) {
      if (e instanceof TooManyRequestsError) {
        throw e;
      }
      await this.eventThrow();
    }
  }

  protected async eventThrow(): Promise<void> {
    const { maxRetries, increaseRetries, deleteEvent } = this.port;
    const { id, retries } = this.eventData!;
    if (retries >= maxRetries) {
      await deleteEvent(id);
    } else {
      await increaseRetries(id);
    }
  }
}
