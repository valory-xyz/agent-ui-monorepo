import { PROTOCOL_IMAGE_MAP, PROTOCOLS_MAP } from '../../src/constants/textMaps';

describe('textMaps (babydegen-ui)', () => {
  it.each([
    ['velodrome', 'Velodrome', '/logos/protocols/velodrome.png'],
    ['aerodrome', 'Aerodrome', '/logos/protocols/aerodrome.png'],
    ['aero', 'Aero', '/logos/protocols/aero.png'],
  ] as const)('maps %s to the %s name and logo', (key, name, logo) => {
    expect(PROTOCOLS_MAP[key]).toEqual({ name, logo });
    expect(PROTOCOL_IMAGE_MAP[key]).toBe(logo);
  });

  it('keeps the logo consistent between PROTOCOLS_MAP and PROTOCOL_IMAGE_MAP', () => {
    for (const key of Object.keys(PROTOCOLS_MAP) as (keyof typeof PROTOCOLS_MAP)[]) {
      expect(PROTOCOL_IMAGE_MAP[key]).toBe(PROTOCOLS_MAP[key].logo);
    }
  });

  it('gives every protocol a distinct logo', () => {
    const logos = Object.values(PROTOCOL_IMAGE_MAP);
    expect(new Set(logos).size).toBe(logos.length);
  });
});
