/**
 * Delays for the specified number of seconds, then resolves with the provided value.
 *
 * @param value The value to resolve the promise with after the delay.
 * @param delayInSeconds The delay duration in seconds before the promise resolves.
 * @returns Promise that resolves with the provided value after the delay.
 */
export const delay = <T>(value: T, delayInSeconds = 2): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delayInSeconds * 1000);
  });
};
