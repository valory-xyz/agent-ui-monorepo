import { render, screen } from '@testing-library/react';

import { WhitelistedAddresses } from '../../src/components/WhitelistedAddresses/WhitelistedAddresses';

describe('WhitelistedAddresses', () => {
  it('renders each entry as a truncated address with its chain', () => {
    render(
      <WhitelistedAddresses
        whitelist={{
          gnosis: ['0x735faab1c4ec41128c367afb5c3bac73509f70bb'],
          polygon: ['0x343f2b005cf6d70ba610cd9f1f1927049414b582'],
        }}
      />,
    );

    expect(screen.getByText('Whitelisted addresses')).toBeInTheDocument();
    expect(
      screen.getByText('Specifies allowed web3 addresses your agent can interact with.'),
    ).toBeInTheDocument();
    expect(screen.getByText('0x735f...70bb')).toBeInTheDocument();
    expect(screen.getByText('Chain: gnosis')).toBeInTheDocument();
    expect(screen.getByText('0x343f...b582')).toBeInTheDocument();
    expect(screen.getByText('Chain: polygon')).toBeInTheDocument();
  });

  it('shows the full address on hover via the title attribute', () => {
    render(
      <WhitelistedAddresses
        whitelist={{ gnosis: ['0x735faab1c4ec41128c367afb5c3bac73509f70bb'] }}
      />,
    );

    expect(screen.getByTitle('0x735faab1c4ec41128c367afb5c3bac73509f70bb')).toHaveTextContent(
      '0x735f...70bb',
    );
  });
});
