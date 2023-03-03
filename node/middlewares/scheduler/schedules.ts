export const SCHEDULES = [
  {
    id: 'nosto-updated-sync',
    cron: '*/10 * * * *', // every 10 minutes
    path: '/nosto/_v/verify-update-of-all-products',
  },
  {
    id: 'nosto-products-sync',
    cron: '0 0 */1 * *', // at 00:00 on every day
    path: '/nosto/_v/send-all-products',
  },
  {
    id: 'nosto-events-watcher',
    cron: '* * * * *', // every minute
    path: '/nosto/_v/events-watcher',
  },
];
