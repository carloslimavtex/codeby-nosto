import nostoEventsWatcherPort from './port';
import NostoEventsWatcherUseCase from './use-case';

export default async function nostoEventsWatcherMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { events, nostoEvents },
  } = ctx;

  const port = nostoEventsWatcherPort({ events, nostoEvents });
  const useCase = new NostoEventsWatcherUseCase(port);
  await useCase.execute();
  await next();
}
