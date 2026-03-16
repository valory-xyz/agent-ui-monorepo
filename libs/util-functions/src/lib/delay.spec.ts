import { delay } from './delay';

describe('delay', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns a Promise', () => {
    const result = delay('x');
    expect(result).toBeInstanceOf(Promise);
  });

  it('resolves with the given value after the default 2 s', async () => {
    const promise = delay('hello');
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBe('hello');
  });

  it('resolves with a custom delay duration', async () => {
    const promise = delay(42, 5);
    jest.advanceTimersByTime(4999);
    // should not have resolved yet — keep reference for later
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it('resolves immediately when delayInSeconds is 0', async () => {
    const promise = delay('instant', 0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBe('instant');
  });

  it('resolves with null', async () => {
    const promise = delay<null>(null);
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBeNull();
  });

  it('resolves with an object', async () => {
    const obj = { a: 1 };
    const promise = delay(obj);
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBe(obj);
  });

  it('resolves with a number', async () => {
    const promise = delay<number>(99);
    jest.advanceTimersByTime(2000);
    await expect(promise).resolves.toBe(99);
  });
});
