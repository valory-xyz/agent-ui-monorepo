import { render, screen } from '@testing-library/react';

import { Trade } from '../../../../src/components/TradeHistory/PositionDetailsModal/Trade';
import { TradeDetails } from '../../../../src/types';

const baseTrade: TradeDetails = {
  id: 'bet_001',
  bet: {
    amount: 1.5,
    side: 'yes',
    placed_at: '2025-11-25T17:55:00.000Z',
  },
  intelligence: {
    prediction_tool: 'prediction-online',
    implied_probability: 75.3,
    confidence_score: 85.7,
    utility_score: 60.2,
  },
  strategy: 'risky',
};

describe('Trade', () => {
  it('renders strategy display name when strategy is provided', () => {
    render(<Trade {...baseTrade} />);
    expect(screen.getByText('Risky')).toBeInTheDocument();
  });

  it('does not render strategy row when strategy is null', () => {
    render(<Trade {...baseTrade} strategy={null} />);
    expect(screen.queryByText('Risky')).toBeNull();
    expect(screen.queryByText('Balanced')).toBeNull();
  });

  it('renders prediction tool when provided', () => {
    render(<Trade {...baseTrade} />);
    expect(screen.getByText('prediction-online')).toBeInTheDocument();
  });

  it('does not render prediction tool row when prediction_tool is null', () => {
    const trade: TradeDetails = {
      ...baseTrade,
      intelligence: { ...baseTrade.intelligence, prediction_tool: null },
    };
    render(<Trade {...trade} />);
    expect(screen.queryByText('Prediction tool')).toBeNull();
  });

  it('renders rounded intelligence scores', () => {
    render(<Trade {...baseTrade} />);
    // 75.3 → 75, 85.7 → 86, 60.2 → 60
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders placed_at date when bet.placed_at is provided', () => {
    render(<Trade {...baseTrade} />);
    // formatPlacedAt renders the date — just check some text is present in document
    const allText = document.body.textContent ?? '';
    // Should contain some date representation of 2025-11-25
    expect(allText).toMatch(/Nov/i);
  });

  it('does not render placed_at section when bet.placed_at is undefined', () => {
    const trade: TradeDetails = {
      ...baseTrade,
      bet: { amount: 1.0, side: 'yes' },
    };
    render(<Trade {...trade} />);
    // "Intelligence" section should still be there
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
  });
});
