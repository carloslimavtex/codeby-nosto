import { SCHEDULES } from './schedules';

export default function generateSchedulerMiddleware() {
  // should only verify missing scheduler one time
  let MISSING_SCHEDULER_WORKS = true;

  return async function schedulerMiddleware(ctx: Context, next: () => Promise<void>) {
    const {
      clients: { scheduler },
    } = ctx;

    if (MISSING_SCHEDULER_WORKS) {
      for (const { id, cron, path } of SCHEDULES) {
        const {
          vtex: { workspace, account },
        } = ctx;
        const uri = `https://${workspace}--${account}.myvtex.com${path}`;
        await scheduler.createOrUpdateIfNeeded(id, uri, cron);
      }

      MISSING_SCHEDULER_WORKS = false;
    }

    await next();
  };
}
