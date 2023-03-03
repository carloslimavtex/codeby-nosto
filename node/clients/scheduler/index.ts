import { JanusClient, IOContext, InstanceOptions } from '@vtex/api';
import { consoleInfo } from '../../utils/console';

export type ScheduleData = {
  id: string;
  scheduler: {
    expression: string;
    endDate: string;
  };
  request: {
    uri: string;
    method: string;
    headers: Record<string, string>;
    body: null;
  };
};

export type ScheduleResponse = {
  id: string;
  workspace: string;
  app: string;
  request: {
    uri: string;
    method: string;
    headers: Record<string, string>;
    body: null;
  };
  retry: {
    delay: {
      addMinutes: number;
      addHours: number;
      addDays: number;
    };
    times: number;
    backOffRate: number;
  };
  attempt: number;
  endDate: string;
  expression: string;
  NextExecution: string;
};

export const route = (workspace: string, account: string, id?: string) =>
  `/api/scheduler/${workspace}/${account}${id ? `/${id}` : ''}?version=4`;
const SCHEDULE_END_DATE = '2029-12-30T23:29:00';

export default class Scheduler extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: context.authToken,
      },
    });
  }

  private route(id?: string) {
    const { workspace, account } = this.context;
    return route(workspace, account, id);
  }

  private createOrUpdateSchedule(scheduler: ScheduleData): Promise<ScheduleResponse> {
    return this.http.put(this.route(), scheduler, {
      metric: 'nosto-scheduler-create-or-update',
    });
  }

  private async get(schedulerId: string): Promise<ScheduleResponse | null> {
    try {
      return await this.http.get<ScheduleResponse>(this.route(schedulerId), { metric: 'nosto-scheduler-get' });
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async createOrUpdateIfNeeded(schedulerId: string, uri: string, cronExpression: string): Promise<void> {
    const scheduleData = await this.get(schedulerId);
    if (scheduleData) {
      const {
        expression,
        request: { uri: responseUri },
      } = scheduleData;
      if (expression === cronExpression && uri === responseUri) {
        consoleInfo('scheduler.createOrUpdateSchedule found schedule for', schedulerId);
        return;
      }
    }

    consoleInfo(`scheduler.createOrUpdateSchedule not found for ${schedulerId}. Creating!`);

    await this.createOrUpdateSchedule({
      id: schedulerId,
      scheduler: {
        expression: cronExpression,
        endDate: SCHEDULE_END_DATE,
      },
      request: {
        uri,
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
          pragma: 'no-cache',
        },
        body: null,
      },
    });
  }

  public async delete(schedulerId: string): Promise<void> {
    await this.http.delete(this.route(schedulerId), { metric: 'nosto-scheduler-delete' });
  }
}
