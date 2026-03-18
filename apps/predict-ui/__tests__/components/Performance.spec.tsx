import { render, screen } from '@testing-library/react';

import { AgentPerformance } from '../../src/components/Performance';
import { AgentMetricsResponse } from '../../src/types';

const mockPerformance: AgentMetricsResponse = {
  agent_id: 'agent_123',
  window: 'lifetime',
  currency: 'USD',
  metrics: {
    all_time_funds_used: 20.55,
    all_time_profit: 2.1,
    funds_locked_in_markets: 0.125,
    available_funds: 10.9,
    roi: 0.44,
  },
  stats: {
    predictions_made: 1002,
    prediction_accuracy: 0.53,
  },
};

describe('AgentPerformance', () => {
  it('renders the "Performance" heading', () => {
    render(<AgentPerformance performance={mockPerformance} />);
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('renders all 6 metric labels', () => {
    render(<AgentPerformance performance={mockPerformance} />);
    expect(screen.getByText('All time funds used')).toBeInTheDocument();
    expect(screen.getByText('All time profit')).toBeInTheDocument();
    expect(screen.getByText('Funds locked in markets')).toBeInTheDocument();
    expect(screen.getByText('Available funds')).toBeInTheDocument();
    expect(screen.getByText('Predictions made')).toBeInTheDocument();
    expect(screen.getByText('Prediction accuracy')).toBeInTheDocument();
  });

  it('formats predictions_made with Intl.NumberFormat', () => {
    render(<AgentPerformance performance={mockPerformance} />);
    // 1002 → "1,002"
    expect(screen.getByText('1,002')).toBeInTheDocument();
  });

  it('renders prediction_accuracy as percentage', () => {
    render(<AgentPerformance performance={mockPerformance} />);
    // 0.53 → "53.00%"
    expect(screen.getByText('53.00%')).toBeInTheDocument();
  });

  it('shows text variant message when prediction_accuracy is null', () => {
    const perf: AgentMetricsResponse = {
      ...mockPerformance,
      stats: { ...mockPerformance.stats, prediction_accuracy: null },
    };
    render(<AgentPerformance performance={perf} />);
    expect(screen.getByText('Will appear with the first resolved market.')).toBeInTheDocument();
  });

  it('shows "0.00%" when prediction_accuracy is 0', () => {
    const perf: AgentMetricsResponse = {
      ...mockPerformance,
      stats: { ...mockPerformance.stats, prediction_accuracy: 0 },
    };
    render(<AgentPerformance performance={perf} />);
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });
});
