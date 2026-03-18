import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { PositionDetailsModal } from '../../../../src/components/TradeHistory/PositionDetailsModal/PositionDetailsModal';
import { usePositionDetails } from '../../../../src/hooks/useTradeHistory';
import { PositionDetails } from '../../../../src/types';

jest.mock('../../../../src/hooks/useTradeHistory');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockPositionData: PositionDetails = {
  id: 'pos_123',
  question: 'Will something happen?',
  currency: 'USD',
  total_bet: 1.82,
  payout: 2.05,
  status: 'pending',
  remaining_seconds: 3600,
  net_profit: 0,
  external_url: 'https://example.com/market',
  bets: [
    {
      id: 'bet_001',
      bet: { amount: 1.82, side: 'yes' },
      intelligence: {
        prediction_tool: null,
        implied_probability: 15,
        confidence_score: 85,
        utility_score: 95,
      },
      strategy: 'risky',
    },
  ],
};

describe('PositionDetailsModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading skeleton when isLoading=true', () => {
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: true,
      data: undefined,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    // Modal renders in a portal; use document.querySelector
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('shows error alert when error is present', () => {
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error('Network error'),
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders question when data is available', () => {
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockPositionData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    // Text includes the EXTERNAL_LINK unicode symbol appended in the component
    expect(screen.getByText(/Will something happen\?/)).toBeInTheDocument();
  });

  it('shows invalid market alert when status is invalid', () => {
    const invalidData: PositionDetails = { ...mockPositionData, status: 'invalid' };
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: invalidData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Invalid market')).toBeInTheDocument();
  });

  it('shows "Payout" label for invalid status', () => {
    const invalidData: PositionDetails = { ...mockPositionData, status: 'invalid' };
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: invalidData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Payout')).toBeInTheDocument();
  });

  it('shows "Won" label for won status', () => {
    const wonData: PositionDetails = { ...mockPositionData, status: 'won', net_profit: 0.5 };
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: wonData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Won')).toBeInTheDocument();
  });

  it('shows "To win" label for pending status', () => {
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockPositionData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('To win')).toBeInTheDocument();
  });

  it('shows "No trades found." when bets array is empty', () => {
    const emptyBetsData: PositionDetails = { ...mockPositionData, bets: [] };
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: emptyBetsData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('No trades found.')).toBeInTheDocument();
  });

  it('uses "Trade" label for single bet', () => {
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: mockPositionData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Trade')).toBeInTheDocument();
  });

  it('uses "Trade 1", "Trade 2" labels for multiple bets', () => {
    const multiBetsData: PositionDetails = {
      ...mockPositionData,
      bets: [
        { ...mockPositionData.bets[0], id: 'b1' },
        { ...mockPositionData.bets[0], id: 'b2' },
      ],
    };
    (usePositionDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      data: multiBetsData,
      error: null,
    });
    render(<PositionDetailsModal id="pos_1" onClose={onClose} />, { wrapper: createWrapper() });
    expect(screen.getByText('Trade 1')).toBeInTheDocument();
    expect(screen.getByText('Trade 2')).toBeInTheDocument();
  });
});
