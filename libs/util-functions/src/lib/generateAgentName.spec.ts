import { generateAgentName } from './generateAgentName';

describe('generateAgentName', () => {
  it('should generate a name in the correct format', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const name = generateAgentName(address);

    // Name should be in format: firstName-lastNamePrefixXX
    expect(name).toMatch(/^[a-z]+-[a-z]+\d{2}$/);
  });

  it('should generate consistent names for the same address', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const name1 = generateAgentName(address);
    const name2 = generateAgentName(address);

    expect(name1).toBe(name2);
  });

  it('should generate different names for different addresses', () => {
    const address1 = '0x1234567890abcdef1234567890abcdef12345678';
    const address2 = '0x876543210fedcba9876543210fedcba987654321';

    const name1 = generateAgentName(address1);
    const name2 = generateAgentName(address2);

    expect(name1).not.toBe(name2);
  });

  it('should handle addresses with non-hex characters', () => {
    const address = '0x1234567890abcdef1234567890abcdef1234567g'; // 'g' is not hex
    const name = generateAgentName(address);

    expect(name).toMatch(/^[a-z]+-[a-z]+\d{2}$/);
  });

  it('output ends with exactly two digits', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const name = generateAgentName(address);
    const suffix = name.split('-')[1];

    expect(suffix).toMatch(/\d{2}$/);
  });

  it('contains exactly one hyphen separator', () => {
    const address = '0xabcdef1234567890abcdef1234567890abcdef12';
    const name = generateAgentName(address);

    expect(name.split('-')).toHaveLength(2);
  });

  it('numeric suffix is in range [0, 99]', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const name = generateAgentName(address);
    const numericSuffix = parseInt(name.match(/\d{2}$/)![0], 10);

    expect(numericSuffix).toBeGreaterThanOrEqual(0);
    expect(numericSuffix).toBeLessThanOrEqual(99);
  });

  it('does not throw for an empty string address', () => {
    expect(() => generateAgentName('')).not.toThrow();
  });

  it('all-zero address produces a deterministic name', () => {
    const address = '0x' + '0'.repeat(40);
    const name1 = generateAgentName(address);
    const name2 = generateAgentName(address);

    expect(name1).toBe(name2);
  });

  it('handles a very long address without throwing', () => {
    const address = '0x' + 'a'.repeat(100);
    expect(() => generateAgentName(address)).not.toThrow();
  });
});
