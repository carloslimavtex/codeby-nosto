import generateExecuteEventWithBody from './middleware/execute-event-with-body';
import nostoEventPort from './port';
import NostoEventUseCase from './use-case';

export default async function nostoEventMiddleware(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { nostoEvents },
    body,
  } = ctx;
  const port = nostoEventPort({
    body,
    nostoEvents,
    executeEventWithBody: generateExecuteEventWithBody(ctx, next),
  });

  const useCase = new NostoEventUseCase(port);

  await useCase.execute();
}
