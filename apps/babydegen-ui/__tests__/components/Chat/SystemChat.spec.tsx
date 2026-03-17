import { render, screen } from '@testing-library/react';

import { OperatingProtocols, TradingStrategy } from '../../../src/components/Chat/SystemChat';

describe('TradingStrategy', () => {
  it('renders "Trading strategy updated:" label', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Trading strategy updated:')).toBeTruthy();
  });

  it('renders from and to pills', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Balanced')).toBeTruthy();
    expect(screen.getByText('Risky')).toBeTruthy();
  });

  it('renders same-value transition', () => {
    render(<TradingStrategy from="risky" to="risky" />);
    expect(screen.getAllByText('Risky')).toHaveLength(2);
  });
});

describe('OperatingProtocols', () => {
  it('renders "Operating protocols updated:" label', () => {
    render(<OperatingProtocols protocols={['balancerPool']} />);
    expect(screen.getByText('Operating protocols updated:')).toBeTruthy();
  });

  it('renders protocol name', () => {
    render(<OperatingProtocols protocols={['balancerPool']} />);
    expect(screen.getByText('Balancer')).toBeTruthy();
  });

  it('renders n/a when protocols is empty', () => {
    render(<OperatingProtocols protocols={[]} />);
    expect(screen.getByText('n/a')).toBeTruthy();
  });

  it('renders multiple protocols', () => {
    render(<OperatingProtocols protocols={['balancerPool', 'velodrome']} />);
    expect(screen.getByText('Balancer')).toBeTruthy();
    expect(screen.getByText('Velodrome')).toBeTruthy();
  });
});
