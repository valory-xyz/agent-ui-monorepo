import {
  API_V1,
  FIVE_MINUTES,
  FIVE_SECONDS,
  LOCAL,
  NA,
  OLAS_ADDRESS,
  ONE_MINUTE,
  ONE_SECOND,
  UNICODE_SYMBOLS,
} from '.';

describe('util-constants-and-types', () => {
  describe('symbols', () => {
    it('NA equals "n/a"', () => {
      expect(NA).toBe('n/a');
    });

    it('UNICODE_SYMBOLS has all expected keys', () => {
      expect(UNICODE_SYMBOLS).toHaveProperty('OLAS');
      expect(UNICODE_SYMBOLS).toHaveProperty('EXTERNAL_LINK');
      expect(UNICODE_SYMBOLS).toHaveProperty('BULLET');
      expect(UNICODE_SYMBOLS).toHaveProperty('SMALL_BULLET');
    });

    it('UNICODE_SYMBOLS values are non-empty strings', () => {
      Object.values(UNICODE_SYMBOLS).forEach((value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('time constants', () => {
    it('ONE_SECOND is 1000 ms', () => {
      expect(ONE_SECOND).toBe(1000);
    });

    it('FIVE_SECONDS is 5000 ms', () => {
      expect(FIVE_SECONDS).toBe(5000);
    });

    it('ONE_MINUTE is 60000 ms', () => {
      expect(ONE_MINUTE).toBe(60000);
    });

    it('FIVE_MINUTES is 300000 ms', () => {
      expect(FIVE_MINUTES).toBe(300000);
    });

    it('FIVE_SECONDS is less than FIVE_MINUTES', () => {
      expect(FIVE_SECONDS).toBeLessThan(FIVE_MINUTES);
    });

    it('all time constants are positive', () => {
      [ONE_SECOND, FIVE_SECONDS, ONE_MINUTE, FIVE_MINUTES].forEach((t) => {
        expect(t).toBeGreaterThan(0);
      });
    });
  });

  describe('URLs', () => {
    it('LOCAL is a non-empty string', () => {
      expect(typeof LOCAL).toBe('string');
      expect(LOCAL.length).toBeGreaterThan(0);
    });

    it('API_V1 includes LOCAL', () => {
      expect(API_V1).toContain(LOCAL);
    });

    it('API_V1 is a non-empty string', () => {
      expect(typeof API_V1).toBe('string');
      expect(API_V1.length).toBeGreaterThan(0);
    });
  });

  describe('addresses', () => {
    it('OLAS_ADDRESS is a valid Ethereum address', () => {
      expect(OLAS_ADDRESS).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
  });
});
