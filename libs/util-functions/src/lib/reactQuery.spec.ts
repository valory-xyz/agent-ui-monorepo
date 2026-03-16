import { exponentialBackoffDelay } from './reactQuery';

describe('exponentialBackoffDelay', () => {
  it('returns 1000 ms on attempt 0', () => {
    expect(exponentialBackoffDelay(0)).toBe(1000);
  });

  it('returns 2000 ms on attempt 1', () => {
    expect(exponentialBackoffDelay(1)).toBe(2000);
  });

  it('returns 4000 ms on attempt 2', () => {
    expect(exponentialBackoffDelay(2)).toBe(4000);
  });

  it('returns 8000 ms on attempt 3', () => {
    expect(exponentialBackoffDelay(3)).toBe(8000);
  });

  it('returns 16000 ms on attempt 4', () => {
    expect(exponentialBackoffDelay(4)).toBe(16000);
  });

  it('caps at 30000 ms on attempt 5', () => {
    expect(exponentialBackoffDelay(5)).toBe(30000);
  });

  it('never exceeds 30000 ms for large attempt counts', () => {
    expect(exponentialBackoffDelay(10)).toBe(30000);
    expect(exponentialBackoffDelay(100)).toBe(30000);
  });
});
