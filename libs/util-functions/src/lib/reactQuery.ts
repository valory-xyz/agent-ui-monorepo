/**
 * Calculates exponential backoff delay for retry attempts
 *
 * @param failureCount - The current retry attempt number (0-based)
 * @returns The delay in milliseconds, capped at maxDelay of 30 seconds
 */
export const exponentialBackoffDelay = (failureCount: number): number => {
  return Math.min(1000 * 2 ** failureCount, 30000);
};
