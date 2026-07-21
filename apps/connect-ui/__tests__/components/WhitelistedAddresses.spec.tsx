import { render, screen } from '@testing-library/react';

import { WhitelistedAddresses } from '../../src/components/WhitelistedAddresses/WhitelistedAddresses';

describe('WhitelistedAddresses', () => {
  it('renders the section heading and description without listing addresses', () => {
    render(<WhitelistedAddresses />);

    expect(screen.getByText('Whitelisted addresses')).toBeInTheDocument();
    expect(
      screen.getByText('Specifies allowed web3 addresses your agent can interact with.'),
    ).toBeInTheDocument();
    // The whitelist entries themselves are deliberately not rendered.
    expect(screen.queryByText(/^0x/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Chain:/)).not.toBeInTheDocument();
  });
});
