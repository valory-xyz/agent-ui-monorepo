import { render, screen } from '@testing-library/react';

import { TradingStrategy } from '../../../src/components/Chat/SystemChat';

describe('TradingStrategy', () => {
  it('renders "Strategy updated:" label', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Strategy updated:')).toBeTruthy();
  });

  it('renders the "from" strategy pill', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Balanced')).toBeTruthy();
  });

  it('renders the "to" strategy pill', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Risky')).toBeTruthy();
  });

  it('renders both pills for risky → balanced transition', () => {
    render(<TradingStrategy from="risky" to="balanced" />);
    expect(screen.getByText('Risky')).toBeTruthy();
    expect(screen.getByText('Balanced')).toBeTruthy();
  });

  it('renders without crashing when from equals to', () => {
    expect(() => render(<TradingStrategy from="balanced" to="balanced" />)).not.toThrow();
  });
});
