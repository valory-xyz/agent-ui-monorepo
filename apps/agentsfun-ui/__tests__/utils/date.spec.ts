import { formatTimestampToMonthDay } from '../../src/utils/date';

describe('formatTimestampToMonthDay', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('formats month and day using the short month name', () => {
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('Jan');
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(1);

    expect(formatTimestampToMonthDay(0)).toBe('Jan 1');
  });

  it('returns a compact "Mon D" string for non-zero timestamps', () => {
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('Dec');
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(25);

    expect(formatTimestampToMonthDay(1735128000)).toBe('Dec 25');
  });
});
