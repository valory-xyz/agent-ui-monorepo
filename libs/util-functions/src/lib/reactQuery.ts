/**
 * Calculates exponential backoff delay for retry attempts
 * @param failureCount - The current retry attempt number (0-based)
 * @param _error - The error that caused the retry (unused)
 * @param maxDelay - Maximum delay in milliseconds (default: 30000)
 * @returns The delay in milliseconds, capped at maxDelay
 */
export const exponentialBackoffDelay = (
  failureCount: number,
  _error: Error,
  maxDelay = 30000,
): number => {
  return Math.min(1000 * 2 ** failureCount, maxDelay);
};
