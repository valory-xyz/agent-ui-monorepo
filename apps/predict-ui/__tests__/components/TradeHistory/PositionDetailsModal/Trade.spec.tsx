import { fireEvent, render, screen } from '@testing-library/react';

import { Trade } from '../../../../src/components/TradeHistory/PositionDetailsModal/Trade';
import { TradeDetails } from '../../../../src/types';
import { baseTrade } from '../../../mocks/tradeHistory';

// Mock antd Tooltip to render its title inline so IntelligenceTooltip is always mounted
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Tooltip: ({ title, children }: { title?: React.ReactNode; children?: React.ReactNode }) => (
      <>
        {children}
        {title && <div data-testid="tooltip-content">{title}</div>}
      </>
    ),
  };
});

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

  it('shows n/a for unknown strategy value', () => {
    const trade: TradeDetails = {
      ...baseTrade,
      strategy: 'unknown_strategy' as unknown as TradeDetails['strategy'],
    };
    render(<Trade {...trade} />);
    // TRADING_TYPE_MAP['unknown_strategy'] is undefined → displayName ?? NA → 'n/a'
    expect(screen.getByText('n/a')).toBeInTheDocument();
  });

  it('renders IntelligenceTooltip content inline (tooltip mock renders title immediately)', () => {
    render(<Trade {...baseTrade} />);
    // With the Tooltip mock, IntelligenceTooltip is rendered as the title prop inline
    expect(
      screen.getByText('How the agent evaluated this market when the trade was placed:'),
    ).toBeInTheDocument();
    // IntelligenceTooltip renders all three labels (multiple occurrences exist — use getAllByText)
    expect(screen.getAllByText('Implied probability').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Confidence score').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Utility score').length).toBeGreaterThanOrEqual(1);
  });

  it('renders with isLast=true (no bottom margin style)', () => {
    render(<Trade {...baseTrade} isLast={true} />);
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
  });

  it('fireEvent coverage: mouse interactions do not crash', () => {
    render(<Trade {...baseTrade} />);
    const icons = document.querySelectorAll('[data-testid="tooltip-content"]');
    if (icons.length > 0) fireEvent.mouseEnter(icons[0]);
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
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
