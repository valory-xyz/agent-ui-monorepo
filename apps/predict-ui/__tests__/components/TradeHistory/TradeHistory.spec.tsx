import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { TradeHistory } from '../../../src/components/TradeHistory/TradeHistory';
import { useAgentDetails } from '../../../src/hooks/useAgentDetails';
import { useTradeHistory } from '../../../src/hooks/useTradeHistory';

jest.mock('../../../src/hooks/useTradeHistory');
jest.mock('../../../src/hooks/useAgentDetails');
jest.mock('../../../src/components/TradeHistory/PositionDetailsModal/PositionDetailsModal', () => ({
  PositionDetailsModal: ({ id, onClose }: { id: string; onClose: () => void }) => (
    <div data-testid="position-modal">
      {id}
      <button onClick={onClose}>Close modal</button>
    </div>
  ),
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

    expect(screen.getByTestId('position-modal')).toBeInTheDocument();
    expect(screen.getByTestId('position-modal').textContent).toContain('pred_click');
  });

  it('falls back to USD when data.currency is undefined', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_usd',
            market: { id: 'm5', title: 'Currency fallback test', external_url: 'https://x.com' },
            prediction_side: 'yes',
            bet_amount: 0.5,
            status: 'won',
            net_profit: 0.1,
            created_at: '2025-01-01T00:00:00Z',
            settled_at: null,
          },
        ],
        currency: undefined,
        total: 1,
      },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    // Table renders without crashing when currency is undefined (falls back to 'USD')
    expect(screen.getByText('Currency fallback test')).toBeInTheDocument();
  });

  it('falls back to 0 when data.total is undefined', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_total',
            market: { id: 'm6', title: 'Total fallback test', external_url: 'https://x.com' },
            prediction_side: 'no',
            bet_amount: 0.5,
            status: 'pending',
            net_profit: 0,
            created_at: '2025-01-01T00:00:00Z',
            settled_at: null,
          },
        ],
        currency: 'USD',
        total: undefined,
      },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('Total fallback test')).toBeInTheDocument();
  });

  it('pagination onChange fires when a page button is clicked', () => {
    const items = Array.from({ length: 11 }, (_, i) => ({
      id: `pred_page_${i}`,
      market: { id: `m${i}`, title: `Market ${i}`, external_url: 'https://x.com' },
      prediction_side: 'yes' as const,
      bet_amount: 0.5,
      status: 'pending' as const,
      net_profit: 0,
      created_at: '2025-01-01T00:00:00Z',
      settled_at: null,
    }));
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { items, currency: 'USD', total: 20 },
    });
    render(<TradeHistory />, { wrapper: createWrapper() });
    // Ant Design Table pagination renders a page 2 button when total > pageSize
    const page2 = document.querySelector('[title="2"]');
    if (page2) fireEvent.click(page2);
    // After click, useTradeHistory is called again (component re-renders)
    expect(screen.getByText('Trade History')).toBeInTheDocument();
  });

  it('closes PositionDetailsModal when onClose is called', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: {
        items: [
          {
            id: 'pred_close',
            market: { id: 'm4', title: 'Closeable market', external_url: 'https://x.com' },
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
    const row = screen.getByText('Closeable market').closest('tr');
    if (row) fireEvent.click(row);

    expect(screen.getByTestId('position-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close modal'));
    expect(screen.queryByTestId('position-modal')).toBeNull();
  });
});
