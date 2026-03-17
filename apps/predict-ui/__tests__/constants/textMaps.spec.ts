import { TRADING_TYPE_MAP } from '../../src/constants/textMaps';

describe('TRADING_TYPE_MAP', () => {
  it('has "risky" entry with type "danger" and displayName "Risky"', () => {
    expect(TRADING_TYPE_MAP.risky.type).toBe('danger');
    expect(TRADING_TYPE_MAP.risky.displayName).toBe('Risky');
  });

  it('has "balanced" entry with type "primary" and displayName "Balanced"', () => {
    expect(TRADING_TYPE_MAP.balanced.type).toBe('primary');
    expect(TRADING_TYPE_MAP.balanced.displayName).toBe('Balanced');
  });

  it('all entries have non-empty displayName and type', () => {
    Object.values(TRADING_TYPE_MAP).forEach((entry) => {
      expect(entry.displayName.length).toBeGreaterThan(0);
      expect(entry.type.length).toBeGreaterThan(0);
    });
  });
});
