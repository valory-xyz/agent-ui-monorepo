import { CURRENCY } from '../../src/constants/currency';

describe('CURRENCY', () => {
  it('has all 4 expected keys', () => {
    expect(CURRENCY).toHaveProperty('USD');
    expect(CURRENCY).toHaveProperty('USDC');
    expect(CURRENCY).toHaveProperty('USDT');
    expect(Object.keys(CURRENCY)).toContain('USDC.e');
  });

  it('every currency symbol is "$"', () => {
    Object.values(CURRENCY).forEach((entry) => {
      expect(entry.symbol).toBe('$');
    });
  });

  it('every currency name is a non-empty string', () => {
    Object.values(CURRENCY).forEach((entry) => {
      expect(typeof entry.name).toBe('string');
      expect(entry.name.length).toBeGreaterThan(0);
    });
  });
});
