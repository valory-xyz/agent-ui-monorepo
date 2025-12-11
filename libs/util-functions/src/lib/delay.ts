/**
 * @returns Promise that resolves with the provided value after the delay
 */
export const delay = <T>(value: T, delayMs = 2000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delayMs);
  });
};
