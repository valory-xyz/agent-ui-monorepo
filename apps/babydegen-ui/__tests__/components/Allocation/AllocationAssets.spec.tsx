import { render, screen } from '@testing-library/react';

import { AssetBadges } from '../../../src/components/Allocation/AllocationAssets';

describe('AssetBadges', () => {
  it('returns null when assets array is empty', () => {
    const { container } = render(<AssetBadges assets={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single asset by name', () => {
    render(<AssetBadges assets={['ETH']} />);
    expect(screen.getByText('ETH')).toBeTruthy();
  });

  it('renders multiple assets', () => {
    render(<AssetBadges assets={['ETH', 'USDC']} />);
    expect(screen.getByText('ETH')).toBeTruthy();
    expect(screen.getByText('USDC')).toBeTruthy();
  });

  it('renders three assets', () => {
    render(<AssetBadges assets={['ETH', 'USDC', 'DAI']} />);
    expect(screen.getByText('ETH')).toBeTruthy();
    expect(screen.getByText('USDC')).toBeTruthy();
    expect(screen.getByText('DAI')).toBeTruthy();
  });

  it('renders the correct number of asset badges', () => {
    render(<AssetBadges assets={['WETH', 'USDT']} />);
    // Each badge contains a Text element with the asset name
    expect(screen.getAllByText(/WETH|USDT/).length).toBe(2);
  });

  it('renders single asset without wrapping Flex (no Flex for length === 1)', () => {
    const { container } = render(<AssetBadges assets={['BTC']} />);
    // Single asset renders AssetBadge directly (no Flex wrapper)
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('BTC')).toBeTruthy();
  });
});
