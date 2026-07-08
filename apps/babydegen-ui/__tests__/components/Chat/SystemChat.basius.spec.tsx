import { render, screen } from '@testing-library/react';

import { OperatingProtocols } from '../../../src/components/Chat/SystemChat';

// Regression test: with live data the Basius backend reports `velodrome`
// (Aerodrome is a Velodrome fork) — the chat protocols message must normalize
// it, same as the Strategy card / Allocation table. agentMap resolves the
// agent from process.env at module load time, so we mock the basius mapping
// here; the env-driven branch itself is unit-covered in utils/agentMap.spec.ts.
jest.mock('../../../src/utils/agentMap', () => ({
  ...jest.requireActual('../../../src/utils/agentMap'),
  normalizeProtocol: (protocol: string) => (protocol === 'velodrome' ? 'aerodrome' : protocol),
}));

describe('OperatingProtocols (basius)', () => {
  it('renders backend-reported velodrome as Aerodrome', () => {
    render(<OperatingProtocols protocols={['velodrome']} />);
    expect(screen.getByText('Aerodrome')).toBeInTheDocument();
    expect(screen.queryByText('Velodrome')).not.toBeInTheDocument();
    expect(screen.getByAltText('aerodrome')).toHaveAttribute(
      'src',
      '/logos/protocols/aerodrome.png',
    );
  });

  it('leaves other protocols untouched', () => {
    render(<OperatingProtocols protocols={['balancerPool', 'velodrome']} />);
    expect(screen.getByText('Balancer')).toBeInTheDocument();
    expect(screen.getByText('Aerodrome')).toBeInTheDocument();
  });
});
