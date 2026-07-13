import { render, screen } from '@testing-library/react';

import { WhitelistedAddresses } from '../../src/components/WhitelistedAddresses/WhitelistedAddresses';

describe('WhitelistedAddresses', () => {
  it('renders well-known addresses with their label and description', () => {
    render(
      <WhitelistedAddresses
        whitelist={{ gnosis: ['0x4554fe75c1f5576c1d7f765b2a036c199adae329'] }}
      />,
    );

    expect(screen.getByText('Whitelisted addresses')).toBeInTheDocument();
    expect(
      screen.getByText('Specifies allowed web3 addresses your agent can interact with.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Olas Marketplace')).toBeInTheDocument();
    expect(
      screen.getByText('Connects your agent to the marketplace with various services.'),
    ).toBeInTheDocument();
  });

  it('falls back to a truncated address and chain for unknown addresses', () => {
    render(
      <WhitelistedAddresses
        whitelist={{ polygon: ['0x1234567890abcdef1234567890abcdef12345678'] }}
      />,
    );

    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(screen.getByText('Chain: polygon')).toBeInTheDocument();
  });
});
