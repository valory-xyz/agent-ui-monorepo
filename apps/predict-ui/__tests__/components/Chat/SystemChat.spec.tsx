import { render, screen } from '@testing-library/react';

import { TradingStrategy } from '../../../src/components/Chat/SystemChat';

describe('TradingStrategy', () => {
  it('renders "Strategy updated:" label', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Strategy updated:')).toBeInTheDocument();
  });

  it('renders the "from" strategy pill', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('renders the "to" strategy pill', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Risky')).toBeInTheDocument();
  });

  it('renders both pills for risky → balanced transition', () => {
    render(<TradingStrategy from="risky" to="balanced" />);
    expect(screen.getByText('Risky')).toBeInTheDocument();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('renders without crashing when from equals to', () => {
    expect(() => render(<TradingStrategy from="balanced" to="balanced" />)).not.toThrow();
  });
});
