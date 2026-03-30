import { render, screen } from '@testing-library/react';

import { OperatingProtocols, TradingStrategy } from '../../../src/components/Chat/SystemChat';

describe('TradingStrategy', () => {
  it('renders "Trading strategy updated:" label', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Trading strategy updated:')).toBeInTheDocument();
  });

  it('renders from and to pills', () => {
    render(<TradingStrategy from="balanced" to="risky" />);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Risky')).toBeInTheDocument();
  });

  it('renders same-value transition', () => {
    render(<TradingStrategy from="risky" to="risky" />);
    expect(screen.getAllByText('Risky')).toHaveLength(2);
  });
});

describe('OperatingProtocols', () => {
  it('renders "Operating protocols updated:" label', () => {
    render(<OperatingProtocols protocols={['balancerPool']} />);
    expect(screen.getByText('Operating protocols updated:')).toBeInTheDocument();
  });

  it('renders protocol name', () => {
    render(<OperatingProtocols protocols={['balancerPool']} />);
    expect(screen.getByText('Balancer')).toBeInTheDocument();
  });

  it('renders n/a when protocols is empty', () => {
    render(<OperatingProtocols protocols={[]} />);
    expect(screen.getByText('n/a')).toBeInTheDocument();
  });

  it('renders multiple protocols', () => {
    render(<OperatingProtocols protocols={['balancerPool', 'velodrome']} />);
    expect(screen.getByText('Balancer')).toBeInTheDocument();
    expect(screen.getByText('Velodrome')).toBeInTheDocument();
  });
});
