/**
 *
 * @param ms timestamp in ms
 * @returns time in format "12 days ago" or "5 hours ago"
 */
export const getTimeAgo = (ms: number, showPostfix = true) => {
  const differenceInMs = Date.now() - ms;

  // Calculate time differences
  const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  const differenceInDays = Math.floor(differenceInHours / 24);
  const differenceInMonths = Math.floor(differenceInDays / 30); // Approximate months

  const postfix = showPostfix ? ` ago` : '';

  if (differenceInMonths > 0) {
    return `${differenceInMonths} month${differenceInMonths > 1 ? 's' : ''}${postfix}`;
  } else if (differenceInDays > 0) {
    return `${differenceInDays} day${differenceInDays > 1 ? 's' : ''}${postfix}`;
  } else if (differenceInHours > 0) {
    return `${differenceInHours} hour${differenceInHours > 1 ? 's' : ''}${postfix}`;
  } else {
    return `${differenceInMinutes} minute${differenceInMinutes > 1 ? 's' : ''}${postfix}`;
  }
};

// Time constants in seconds
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * 60; // 3600
const SECONDS_IN_DAY = 24 * 60 * 60; // 86400

/**
 * Formats a duration in seconds into a human-readable string.
 * @returns A formatted duration string in one of these formats:
 *   - "Xd Yh" (e.g., "5d 3h") when duration >= 1 day
 *   - "Xh Ym" (e.g., "12h 45m") when duration >= 1 hour but < 1 day
 *   - "Xm" (e.g., "30m") when duration < 1 hour
 *   - "0m" when duration is 0 or negative
 *
 * @example
 * formatDuration(0)          // "0m"
 * formatDuration(30)         // "0m" (less than 1 minute)
 * formatDuration(90)         // "1m"
 * formatDuration(5400)       // "1h 30m"
 * formatDuration(93600)      // "1d 2h"
 * formatDuration(172800)     // "2d 0h"
 * formatDuration(-100)       // "0m" (negative handled as 0)
 */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));

  const days = Math.floor(s / SECONDS_IN_DAY);
  const hours = Math.floor((s % SECONDS_IN_DAY) / SECONDS_IN_HOUR);
  const mins = Math.floor((s % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
