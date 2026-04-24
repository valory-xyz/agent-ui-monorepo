import { render, screen } from '@testing-library/react';

import { MetricsOutdatedBanner } from '../../src/components/MetricsOutdatedBanner';

describe('MetricsOutdatedBanner', () => {
  it('renders the last updated timestamp', () => {
    render(<MetricsOutdatedBanner />);
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  it('renders the protocol upgrade description', () => {
    render(<MetricsOutdatedBanner />);
    expect(
      screen.getByText(
        'Performance and activity stats are temporarily not updating after a recent Polymarket protocol upgrade. Your agent works as usual.',
      ),
    ).toBeInTheDocument();
  });
});
