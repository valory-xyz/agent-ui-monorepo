import { PROTOCOLS_MAP } from '../../src/constants/textMaps';

describe('textMaps (babydegen-ui)', () => {
  it.each([
    ['velodrome', 'Velodrome', '/logos/protocols/velodrome.png'],
    ['aerodrome', 'Aerodrome', '/logos/protocols/aerodrome.png'],
    ['aero', 'Aero', '/logos/protocols/aero.png'],
  ] as const)('maps %s to the %s name and logo', (key, name, logo) => {
    expect(PROTOCOLS_MAP[key]).toEqual({ name, logo });
  });

  it('gives every protocol a distinct logo', () => {
    const logos = Object.values(PROTOCOLS_MAP).map(({ logo }) => logo);
    expect(new Set(logos).size).toBe(logos.length);
  });
});
