import { render, screen } from '@testing-library/react';

import { WhitelistedAddresses } from '../../src/components/WhitelistedAddresses/WhitelistedAddresses';

describe('WhitelistedAddresses', () => {
  it('describes the whitelisted destinations without listing raw addresses', () => {
    render(<WhitelistedAddresses />);

    expect(screen.getByText('Whitelisted addresses')).toBeInTheDocument();
    expect(
      screen.getByText('Specifies allowed web3 addresses your agent can interact with.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Olas Marketplace')).toBeInTheDocument();
    expect(
      screen.getByText('Connects your agent to the marketplace with various services.'),
    ).toBeInTheDocument();
    // Raw whitelist entries are deliberately not rendered.
    expect(screen.queryByText(/^0x/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Chain:/)).not.toBeInTheDocument();
  });
});
