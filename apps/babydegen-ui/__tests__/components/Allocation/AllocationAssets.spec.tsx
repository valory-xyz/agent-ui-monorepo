import { render, screen } from '@testing-library/react';

import { AssetBadges } from '../../../src/components/Allocation/AllocationAssets';

describe('AssetBadges', () => {
  it('returns null when assets array is empty', () => {
    const { container } = render(<AssetBadges assets={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single asset badge by name', () => {
    render(<AssetBadges assets={['BTC']} />);
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getAllByText('BTC').length).toBe(1);
  });

  it('renders multiple asset badges with correct count', () => {
    render(<AssetBadges assets={['ETH', 'USDC', 'DAI']} />);
    ['ETH', 'USDC', 'DAI'].forEach((asset) => {
      expect(screen.getByText(asset)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/ETH|USDC|DAI/).length).toBe(3);
  });
});
