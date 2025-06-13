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
});
