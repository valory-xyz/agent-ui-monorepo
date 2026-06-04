import { render, screen } from '@testing-library/react';

import { MetricsUnavailable } from '../../src/components/MetricsUnavailable';

const AGENT_ADDRESS = '0xagentsafeaddress';

describe('MetricsUnavailable', () => {
  it('renders the unavailable title and description', () => {
    render(<MetricsUnavailable agentSafeAddress={AGENT_ADDRESS} />);
    expect(screen.getByText('Activity data unavailable in this app version')).toBeInTheDocument();
    expect(screen.getByText('You can review agent activity on Polymarket.')).toBeInTheDocument();
  });

  it('links the "View agent activity" button to the agent Polymarket profile', () => {
    render(<MetricsUnavailable agentSafeAddress={AGENT_ADDRESS} />);
    const button = screen.getByText('View agent activity').closest('a');
    expect(button).toHaveAttribute('href', expect.stringContaining(AGENT_ADDRESS));
    expect(button).toHaveAttribute('target', '_blank');
  });

  it('omits the activity button when no agent Safe address is provided', () => {
    render(<MetricsUnavailable />);
    expect(screen.queryByText('View agent activity')).toBeNull();
  });
});
