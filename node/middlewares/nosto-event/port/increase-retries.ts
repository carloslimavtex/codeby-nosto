import NostoEvents from '../../../clients/nosto-events';
import { NostoEventPort } from '../use-case';

export default function generateIncreaseRetries(nostoEvents: NostoEvents): NostoEventPort['increaseRetries'] {
  return async function increaseRetries(eventId: string): Promise<void> {
    nostoEvents.increaseEventRetries(eventId);
  };
}
