import generateExecuteEventWithBody from './execute-event-with-body';

function fakeContext() {
  return {
    body: {
      documentId: '123',
    },
  } as Context;
}

describe('generateExecuteEventWithBody', () => {
  it('should be a function', () => {
    expect(typeof generateExecuteEventWithBody).toBe('function');
  });
});

describe('executeEventWithBody', () => {
  it('should be a function', () => {
    expect(typeof generateExecuteEventWithBody(fakeContext(), jest.fn())).toBe('function');
  });

  it('should call next', async () => {
    const next = jest.fn();
    const executeEventWithBody = generateExecuteEventWithBody(fakeContext(), next);
    await executeEventWithBody({ a: 1 });
    expect(next).toHaveBeenCalled();
  });

  it('should change context body while calling next', async () => {
    const context = fakeContext();
    const originalBody = context.body;
    const newBody = { a: 1 };
    let body: unknown = originalBody;
    const next = jest.fn(async () => {
      body = context.body;
    });

    const executeEventWithBody = generateExecuteEventWithBody(context, next);
    await executeEventWithBody(newBody);

    expect(body).not.toBe(originalBody);
    expect(body).toBe(newBody);
  });

  it('should change context body back after calling next', async () => {
    const context = fakeContext();
    const originalBody = context.body;

    const executeEventWithBody = generateExecuteEventWithBody(context, jest.fn());
    await executeEventWithBody({ a: 1 });

    expect(context.body).toBe(originalBody);
  });

  it('should change context body back after calling next event in error', async () => {
    const context = fakeContext();
    const originalBody = context.body;

    const next = jest.fn().mockRejectedValue(new Error('foo'));

    const executeEventWithBody = generateExecuteEventWithBody(context, next);
    await expect(executeEventWithBody({ a: 1 })).rejects.toThrowError('foo');

    expect(context.body).toBe(originalBody);
  });
});
