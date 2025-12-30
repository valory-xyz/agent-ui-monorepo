/**
 * @returns Promise that resolves with the provided value after the delay
 */
export const delay = <T>(value: T, delayInSeconds = 2): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delayInSeconds * 1000);
  });
};
