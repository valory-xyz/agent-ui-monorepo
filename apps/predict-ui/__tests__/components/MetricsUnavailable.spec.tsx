import { render, screen } from '@testing-library/react';

import { MetricsUnavailable } from '../../src/components/MetricsUnavailable';

const AGENT_ADDRESS = '0xagentsafeaddress';
const PREVIOUS_ADDRESS = '0xprevioussafeaddress';

describe('MetricsUnavailable', () => {
  it('renders the unavailable title and base description', () => {
    render(<MetricsUnavailable agentSafeAddress={AGENT_ADDRESS} />);
    expect(
      screen.getByText('Activity data unavailable in this app version'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You can review agent activity on Polymarket\./),
    ).toBeInTheDocument();
  });

  it('links the "View agent activity" button to the current Polymarket profile', () => {
    render(<MetricsUnavailable agentSafeAddress={AGENT_ADDRESS} />);
    const button = screen.getByText('View agent activity').closest('a');
    expect(button).toHaveAttribute(
      'href',
      expect.stringContaining(AGENT_ADDRESS),
    );
    expect(button).toHaveAttribute('target', '_blank');
  });

  it('shows the previous-profile link when a previous Safe address is provided', () => {
    render(
      <MetricsUnavailable
        agentSafeAddress={AGENT_ADDRESS}
        previousSafeAddress={PREVIOUS_ADDRESS}
      />,
    );
    expect(
      screen.getByText(/For the agent activity before Jun 8, 2026/),
    ).toBeInTheDocument();
    const link = screen.getByText(/Polymarket profile/).closest('a');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(PREVIOUS_ADDRESS),
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('omits the previous-profile sentence when no previous Safe address is provided', () => {
    render(<MetricsUnavailable agentSafeAddress={AGENT_ADDRESS} />);
    expect(screen.queryByText(/For the agent activity before/)).toBeNull();
  });

  it('omits the activity button when no agent Safe address is provided', () => {
    render(<MetricsUnavailable previousSafeAddress={PREVIOUS_ADDRESS} />);
    expect(screen.queryByText('View agent activity')).toBeNull();
    // The previous-profile link is still rendered.
    expect(screen.getByText(/Polymarket profile/)).toBeInTheDocument();
  });
});
