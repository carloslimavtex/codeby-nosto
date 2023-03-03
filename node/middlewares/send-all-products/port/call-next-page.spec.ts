import { EventSender, sendAllProducts } from '../../../utils/events';
import generateCallNextPage from './call-next-page';

function createEventSender() {
  return jest.fn() as EventSender;
}

describe('generateCallNextPage', () => {
  it('should be a function', () => {
    expect(typeof generateCallNextPage).toBe('function');
  });

  it('should return a function', () => {
    expect(typeof generateCallNextPage(createEventSender(), 1, 1)).toBe('function');
  });

  it('should create event with eventSender', async () => {
    const eventSender = createEventSender();
    const currentPage = 1;
    const lastScan = 123;
    const callNextPage = generateCallNextPage(eventSender, currentPage, lastScan);

    await callNextPage();

    expect(eventSender).toHaveBeenCalledWith(
      expect.objectContaining({
        eventArgs: sendAllProducts(currentPage + 1, lastScan),
      })
    );
  });
});
