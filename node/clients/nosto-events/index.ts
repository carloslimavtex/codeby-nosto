import { MasterData } from '@vtex/api';
import { EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES } from '../../constants';
import EVENTS_SCHEMA from '../../schemas/events';
import parallel from '../../utils/parallel';
import { toTimestamp } from '../../utils/vtex-timestamp';
import { NostoEvent } from './nosto-event';
import pagination from './pagination';
import toNostoEvent from './to-nosto-event';

export type BatchEvent = {
  documentId: string;
  eventName: string;
};

export default class NostoEvents extends MasterData {
  private createdTable = false;
  private async createTable(): Promise<void> {
    if (!this.createdTable) {
      await this.ignoreIfNotModified(async () => {
        await this.createOrUpdateSchema({
          dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
          schemaName: EVENTS_SCHEMA.SCHEMA_NAME,
          schemaBody: EVENTS_SCHEMA.SCHEMA_BODY,
        });
        this.createdTable = true;
      });
    }
  }

  private async ignoreIfNotModified<T>(cb: () => Promise<T>): Promise<T | void> {
    try {
      return await cb();
    } catch (err) {
      if (err.response?.status !== 304) {
        throw err;
      }
    }
  }

  public async createEvent(
    eventName: string,
    args: unknown,
    nextCallOriginal?: number | Date,
    addToNextCall?: number
  ): Promise<string> {
    let nextCall: number;
    if (nextCallOriginal) {
      nextCall = toTimestamp(nextCallOriginal);
    } else {
      const date = new Date();
      date.setMinutes(date.getMinutes() + EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES);
      nextCall = toTimestamp(date);
    }

    await this.createTable();
    const response = await this.createDocument({
      dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
      schema: EVENTS_SCHEMA.SCHEMA_NAME,
      fields: {
        name: eventName,
        args: JSON.stringify(args ?? {}),
        nextCall,
        addToNextCall,
        retries: 0,
      },
    });

    return response.DocumentId;
  }

  public async getEvent<T>(documentId: string): Promise<NostoEvent<T> | null> {
    await this.createTable();
    const data = await this.getDocument({
      dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
      fields: ['id', 'name', 'args', 'nextCall', 'addToNextCall', 'retries'],
      id: documentId,
    });

    if (!data) {
      return null;
    }

    const event = toNostoEvent<T>(data);

    if (!event) {
      await this.deleteEvent(documentId);
    }

    return event;
  }

  public async updateEventNextCall(documentId: string): Promise<void> {
    await this.createTable();
    const event = await this.getEvent(documentId);
    if (!event) {
      return;
    }

    const now = new Date();
    let nextCall: number;

    if (event.addToNextCall) {
      nextCall = toTimestamp(now) + event.addToNextCall;
    } else {
      now.setMinutes(now.getMinutes() + EVENT_NEXT_CALL_EXTRA_TIME_IN_MINUTES);
      nextCall = toTimestamp(now);
    }

    await this.updatePartialDocument({
      dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
      schema: EVENTS_SCHEMA.SCHEMA_NAME,
      id: documentId,
      fields: {
        nextCall,
      },
    });
  }

  public async increaseEventRetries(documentId: string): Promise<void> {
    await this.createTable();
    const event = await this.getEvent(documentId);
    if (!event) {
      return;
    }

    await this.updatePartialDocument({
      dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
      schema: EVENTS_SCHEMA.SCHEMA_NAME,
      id: documentId,
      fields: {
        retries: event.retries + 1,
      },
    });
  }

  public async deleteEvent(documentId: string): Promise<void> {
    await this.createTable();
    await this.deleteDocument({
      dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
      id: documentId,
    });
  }

  public async getNextEvents(limit = 2000, nextCall?: number): Promise<BatchEvent[]> {
    await this.createTable();

    const pages = pagination(limit, 100);
    let totalRecords = Infinity;
    const nextCallNow = toTimestamp(new Date());

    const data = await parallel({
      data: pages,
      concurrency: 5,
      callback: async ({ page, perPage, count }) => {
        const minimumThisPage = (page - 1) * perPage;
        if (minimumThisPage > totalRecords) {
          return [];
        }

        const searchResponse = await this.searchDocumentsWithPaginationInfo<{ id: string; name: string }>({
          dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
          schema: EVENTS_SCHEMA.SCHEMA_NAME,
          fields: ['id', 'name'],
          sort: 'nextCall ASC',
          where: `nextCall < ${nextCall ?? nextCallNow + 1}`,
          pagination: {
            page,
            pageSize: perPage,
          },
        });

        totalRecords = searchResponse.pagination.total;

        return searchResponse.data.splice(0, count).map((doc) => {
          const record = doc as Record<string, string>;
          return {
            documentId: record.id,
            eventName: record.name,
          };
        });
      },
    });

    const response: BatchEvent[] = [];

    for (const records of data) {
      response.push(...records);
    }

    return response;
  }

  public async getEventsCountFor(eventName?: string): Promise<number> {
    const extraSearch: { where?: string } = {};

    if (eventName) {
      extraSearch.where = `name="${eventName}"`;
    }

    const searchResponse = await this.searchDocumentsWithPaginationInfo<{ id: string; name: string }>({
      dataEntity: EVENTS_SCHEMA.ENTITY_NAME,
      schema: EVENTS_SCHEMA.SCHEMA_NAME,
      fields: ['id', 'name'],
      sort: 'nextCall ASC',
      pagination: {
        page: 1,
        pageSize: 1,
      },
      ...extraSearch,
    });

    return searchResponse.pagination.total;
  }
}
