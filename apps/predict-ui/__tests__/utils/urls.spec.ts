import { getPolymarketProfileUrl } from '../../src/utils/urls';

describe('getPolymarketProfileUrl', () => {
  it('returns a URL containing the address when provided', () => {
    const address = '0xabc123';
    const result = getPolymarketProfileUrl(address);
    expect(result).toBeDefined();
    expect(result).toContain(address);
  });

  it('returns undefined when no address is provided', () => {
    expect(getPolymarketProfileUrl(undefined)).toBeUndefined();
  });

  it('returns undefined when empty string is provided', () => {
    expect(getPolymarketProfileUrl('')).toBeUndefined();
  });

  it('appends address as path segment', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const result = getPolymarketProfileUrl(address);
    expect(result).toMatch(new RegExp(`/${address}$`));
  });
});
