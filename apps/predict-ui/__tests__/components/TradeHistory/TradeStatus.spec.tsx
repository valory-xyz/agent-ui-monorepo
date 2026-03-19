import { render, screen } from '@testing-library/react';

import { TradeStatus } from '../../../src/components/TradeHistory/TradeStatus';

describe('TradeStatus', () => {
  it('shows "Won $0.05" for won status', () => {
    render(<TradeStatus status="won" bet_amount={0.025} net_profit={0.05} currency="USD" />);
    expect(screen.getByText('Won $0.05')).toBeInTheDocument();
  });

  it('shows "Lost $0.025" for lost status', () => {
    render(<TradeStatus status="lost" bet_amount={0.025} net_profit={-0.025} currency="USD" />);
    // Math.abs(-0.025) = 0.025
    expect(screen.getByText('Lost $0.025')).toBeInTheDocument();
  });

  it('shows "Invalid" for invalid status', () => {
    render(<TradeStatus status="invalid" bet_amount={0.025} net_profit={0} currency="USD" />);
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('shows formatted duration when pending with remaining_seconds', () => {
    render(
      <TradeStatus
        status="pending"
        bet_amount={0.025}
        net_profit={0}
        currency="USD"
        remaining_seconds={3600}
      />,
    );
    expect(screen.getByText('1h 0m')).toBeInTheDocument();
  });

  it('shows "Traded $0.025" for pending without remaining_seconds', () => {
    render(<TradeStatus status="pending" bet_amount={0.025} net_profit={0} currency="USD" />);
    expect(screen.getByText('Traded $0.025')).toBeInTheDocument();
  });

  it('uses Math.abs for negative profit on lost status', () => {
    render(<TradeStatus status="lost" bet_amount={0.05} net_profit={-0.05} currency="USD" />);
    // Should show 0.05, not -0.05
    const text = screen.getByText('Lost $0.05');
    expect(text).toBeInTheDocument();
  });

  it('falls back to "$" for an unknown currency code at runtime', () => {
    render(
      <TradeStatus
        status="won"
        bet_amount={1}
        net_profit={2}
        currency={'XYZ' as unknown as import('../../../src/constants/currency').CurrencyCode}
      />,
    );
    expect(screen.getByText('Won $2')).toBeInTheDocument();
  });

  it('shows n/a when net_profit is null for won status', () => {
    render(
      <TradeStatus
        status="won"
        bet_amount={0.025}
        net_profit={null as unknown as number}
        currency="USD"
      />,
    );
    // amount is null → value is '' → getStatusText returns NA ('n/a')
    const { NA } = jest.requireActual('@agent-ui-monorepo/util-constants-and-types');
    expect(screen.getByText(NA)).toBeInTheDocument();
  });

  it('renders extra content when extra prop is provided', () => {
    render(
      <TradeStatus
        status="won"
        bet_amount={0.025}
        net_profit={0.05}
        currency="USD"
        extra={<span>extra</span>}
      />,
    );
    expect(screen.getByText('extra')).toBeInTheDocument();
  });
});
