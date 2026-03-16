import { GLOBAL_COLORS } from './GlobalColors';

describe('GLOBAL_COLORS', () => {
  it('is defined and exported', () => {
    expect(GLOBAL_COLORS).toBeDefined();
  });

  it('contains all expected keys', () => {
    const expectedKeys = [
      'WHITE',
      'BLACK',
      'WHITE_TRANSPARENT_10',
      'WHITE_TRANSPARENT_50',
      'GRAY_TRANSPARENT_20',
      'BLUE_TRANSPARENT_20',
      'RED_TRANSPARENT_20',
      'MEDIUM_GRAY',
      'LIGHT_GRAY',
      'DARK_GRAY',
      'NEUTRAL_GRAY',
      'POLYSTRAT_BACKGROUND',
    ];

    expectedKeys.forEach((key) => {
      expect(GLOBAL_COLORS).toHaveProperty(key);
    });
  });

  it('every value is a non-empty string', () => {
    Object.entries(GLOBAL_COLORS).forEach(([key, value]) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('WHITE is #FFFFFF', () => {
    expect(GLOBAL_COLORS.WHITE).toBe('#FFFFFF');
  });

  it('BLACK is #000000', () => {
    expect(GLOBAL_COLORS.BLACK).toBe('#000000');
  });
});
