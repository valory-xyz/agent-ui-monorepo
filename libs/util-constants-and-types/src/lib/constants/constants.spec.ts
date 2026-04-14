import {
  AGENTS_FUN_URL,
  API_V1,
  FIVE_MINUTES,
  FIVE_SECONDS,
  FORTYFIVE_SECONDS,
  GNOSIS_SCAN_URL,
  LOCAL,
  NA,
  OLAS_ADDRESS,
  ONE_MINUTE,
  ONE_SECOND,
  TEN_SECONDS,
  THIRTY_SECONDS,
  UNICODE_SYMBOLS,
  X_POST_URL,
  X_URL,
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

    it('TEN_SECONDS is 10000 ms', () => {
      expect(TEN_SECONDS).toBe(10000);
    });

    it('THIRTY_SECONDS is 30000 ms', () => {
      expect(THIRTY_SECONDS).toBe(30000);
    });

    it('FORTYFIVE_SECONDS is 45000 ms', () => {
      expect(FORTYFIVE_SECONDS).toBe(45000);
    });

    it('time constants are ordered ascending', () => {
      expect(ONE_SECOND).toBeLessThan(FIVE_SECONDS);
      expect(FIVE_SECONDS).toBeLessThan(TEN_SECONDS);
      expect(TEN_SECONDS).toBeLessThan(THIRTY_SECONDS);
      expect(THIRTY_SECONDS).toBeLessThan(FORTYFIVE_SECONDS);
      expect(FORTYFIVE_SECONDS).toBeLessThan(ONE_MINUTE);
      expect(ONE_MINUTE).toBeLessThan(FIVE_MINUTES);
    });

    it('all time constants are positive', () => {
      [
        ONE_SECOND,
        FIVE_SECONDS,
        TEN_SECONDS,
        THIRTY_SECONDS,
        FORTYFIVE_SECONDS,
        ONE_MINUTE,
        FIVE_MINUTES,
      ].forEach((t) => {
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

    it('GNOSIS_SCAN_URL is a valid HTTPS URL', () => {
      expect(GNOSIS_SCAN_URL).toBe('https://gnosisscan.io');
    });

    it('X_URL is the X (Twitter) base URL', () => {
      expect(X_URL).toBe('https://x.com');
    });

    it('X_POST_URL is built from X_URL', () => {
      expect(X_POST_URL).toContain(X_URL);
      expect(X_POST_URL).toBe(`${X_URL}/i/web/status`);
    });

    it('AGENTS_FUN_URL is the agents.fun HTTPS URL', () => {
      expect(AGENTS_FUN_URL).toBe('https://www.agents.fun');
    });
  });

  describe('addresses', () => {
    it('OLAS_ADDRESS is a valid Ethereum address', () => {
      expect(OLAS_ADDRESS).toMatch(/^0x[0-9a-fA-F]{40}$/);
    });
  });
});
