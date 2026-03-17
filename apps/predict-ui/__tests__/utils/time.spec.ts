import { formatDuration, getTimeAgo } from '../../src/utils/time';

describe('getTimeAgo', () => {
  const NOW = 1700000000000; // fixed reference point

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns minutes for recent timestamps', () => {
    const fiveMinutesAgo = NOW - 5 * 60 * 1000;
    expect(getTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('uses singular "minute" for exactly 1 minute ago', () => {
    const oneMinuteAgo = NOW - 60 * 1000;
    expect(getTimeAgo(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('returns hours for timestamps over 60 minutes ago', () => {
    const twoHoursAgo = NOW - 2 * 60 * 60 * 1000;
    expect(getTimeAgo(twoHoursAgo)).toBe('2 hours ago');
  });

  it('uses singular "hour" for exactly 1 hour ago', () => {
    const oneHourAgo = NOW - 60 * 60 * 1000;
    expect(getTimeAgo(oneHourAgo)).toBe('1 hour ago');
  });

  it('returns days for timestamps over 24 hours ago', () => {
    const threeDaysAgo = NOW - 3 * 24 * 60 * 60 * 1000;
    expect(getTimeAgo(threeDaysAgo)).toBe('3 days ago');
  });

  it('uses singular "day" for exactly 1 day ago', () => {
    const oneDayAgo = NOW - 24 * 60 * 60 * 1000;
    expect(getTimeAgo(oneDayAgo)).toBe('1 day ago');
  });

  it('returns months for timestamps over 30 days ago', () => {
    const twoMonthsAgo = NOW - 60 * 24 * 60 * 60 * 1000;
    expect(getTimeAgo(twoMonthsAgo)).toBe('2 months ago');
  });

  it('uses singular "month" for approximately 1 month ago', () => {
    const oneMonthAgo = NOW - 31 * 24 * 60 * 60 * 1000;
    expect(getTimeAgo(oneMonthAgo)).toBe('1 month ago');
  });

  it('omits "ago" postfix when showPostfix=false', () => {
    const fiveMinutesAgo = NOW - 5 * 60 * 1000;
    expect(getTimeAgo(fiveMinutesAgo, false)).toBe('5 minutes');
  });

  it('returns "0 minutes ago" for future timestamps instead of negative (BUG-002 fix)', () => {
    const futureMs = NOW + 5 * 60 * 1000;
    expect(getTimeAgo(futureMs)).toBe('0 minutes ago');
  });

  it('returns "0 minutes ago" for timestamps equal to now', () => {
    expect(getTimeAgo(NOW)).toBe('0 minutes ago');
  });
});

describe('formatDuration', () => {
  it('returns "0m" for 0 seconds', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('returns "0m" for less than 60 seconds', () => {
    expect(formatDuration(30)).toBe('0m');
  });

  it('returns "1m" for exactly 60 seconds', () => {
    expect(formatDuration(60)).toBe('1m');
  });

  it('returns "30m" for 1800 seconds', () => {
    expect(formatDuration(1800)).toBe('30m');
  });

  it('returns "1h 0m" for exactly 3600 seconds', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
  });

  it('returns "1h 30m" for 5400 seconds', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
  });

  it('returns "1d 0h" for exactly 86400 seconds', () => {
    expect(formatDuration(86400)).toBe('1d 0h');
  });

  it('returns "1d 2h" for 93600 seconds', () => {
    expect(formatDuration(93600)).toBe('1d 2h');
  });

  it('returns "2d 0h" for 172800 seconds', () => {
    expect(formatDuration(172800)).toBe('2d 0h');
  });

  it('returns "0m" for negative seconds', () => {
    expect(formatDuration(-100)).toBe('0m');
  });
});
