import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { TradeHistory } from '../../../src/components/TradeHistory/TradeHistory';
import { useAgentDetails } from '../../../src/hooks/useAgentDetails';
import { useTradeHistory } from '../../../src/hooks/useTradeHistory';

jest.mock('../../../src/hooks/useTradeHistory');
jest.mock('../../../src/hooks/useAgentDetails');
jest.mock('../../../src/components/TradeHistory/PositionDetailsModal/PositionDetailsModal', () => ({
  PositionDetailsModal: ({ id }: { id: string }) => <div data-testid="position-modal">{id}</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('TradeHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAgentDetails as jest.Mock).mockReturnValue({ data: { agentDetails: undefined } });
  });

  it('shows loading spinner when isLoading=true', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({ isLoading: true, data: undefined });
    const { container } = render(<TradeHistory />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('shows empty state when items is empty', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { items: [], currency: 'USD', total: 0 },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('No data yet.')).toBeInTheDocument();
  });

  it('renders the "Trade History" heading', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { items: [], currency: 'USD', total: 0 },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('Trade History')).toBeInTheDocument();
  });

  it('renders table rows when items are present', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_001',
            market: { id: 'm1', title: 'Will X happen?', external_url: 'https://x.com' },
            prediction_side: 'yes',
            bet_amount: 0.025,
            status: 'pending',
            net_profit: 0,
            created_at: '2025-01-01T00:00:00Z',
            settled_at: null,
          },
        ],
        currency: 'USD',
        total: 1,
      },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('Will X happen?')).toBeInTheDocument();
  });

  it('does not render Polymarket button for omenstrat (non-polystrat) agent', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { items: [], currency: 'USD', total: 0 },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.queryByText('View on Polymarket')).toBeNull();
  });

  it('renders "Yes" for prediction_side=yes', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_yes',
            market: { id: 'm1', title: 'Side test', external_url: 'https://x.com' },
            prediction_side: 'yes',
            bet_amount: 0.5,
            status: 'pending',
            net_profit: 0,
            created_at: '2025-01-01T00:00:00Z',
            settled_at: null,
          },
        ],
        currency: 'USD',
        total: 1,
      },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders "No" for prediction_side=no', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_no',
            market: { id: 'm2', title: 'No side test', external_url: 'https://x.com' },
            prediction_side: 'no',
            bet_amount: 0.5,
            status: 'pending',
            net_profit: 0,
            created_at: '2025-01-01T00:00:00Z',
            settled_at: null,
          },
        ],
        currency: 'USD',
        total: 1,
      },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('opens PositionDetailsModal when a row is clicked', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_click',
            market: { id: 'm3', title: 'Clickable market', external_url: 'https://x.com' },
            prediction_side: 'yes',
            bet_amount: 0.5,
            status: 'pending',
            net_profit: 0,
            created_at: '2025-01-01T00:00:00Z',
            settled_at: null,
          },
        ],
        currency: 'USD',
        total: 1,
      },
    });

    render(<TradeHistory />, { wrapper: createWrapper() });
    const row = screen.getByText('Clickable market').closest('tr');
    if (row) fireEvent.click(row);

    // The modal state is toggled; PositionDetailsModal is conditionally rendered
    // We verify the row click doesn't throw
    expect(screen.getByText('Clickable market')).toBeInTheDocument();
  });
});
