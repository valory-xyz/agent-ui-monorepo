// Mock agentMap to simulate polystrat environment
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { TradeHistory } from '../../../src/components/TradeHistory/TradeHistory';
import { useAgentDetails } from '../../../src/hooks/useAgentDetails';
import { useTradeHistory } from '../../../src/hooks/useTradeHistory';

jest.mock('../../../src/utils/agentMap', () => ({
  agentType: 'polystrat_trader',
  isOmenstratAgent: false,
  isPolystratAgent: true,
}));

jest.mock('../../../src/hooks/useTradeHistory', () => ({
  useTradeHistory: jest.fn(),
}));
jest.mock('../../../src/hooks/useAgentDetails', () => ({
  useAgentDetails: jest.fn(),
}));
jest.mock('../../../src/components/TradeHistory/PositionDetailsModal/PositionDetailsModal', () => ({
  PositionDetailsModal: () => null,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('TradeHistory – polystrat agent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders PolymarketButtonSection when agent is polystrat and profileUrl is available', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { items: [], currency: 'USD', total: 0 },
    });
    // Provide an agentDetails id so getPolymarketProfileUrl returns a URL
    (useAgentDetails as jest.Mock).mockReturnValue({
      data: {
        agentDetails: { id: '0xabc123' },
      },
    });

    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.getByText('View on Polymarket')).toBeInTheDocument();
  });

  it('does not render Polymarket button when agentDetails id is missing', () => {
    (useTradeHistory as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { items: [], currency: 'USD', total: 0 },
    });
    (useAgentDetails as jest.Mock).mockReturnValue({
      data: { agentDetails: undefined },
    });

    render(<TradeHistory />, { wrapper: createWrapper() });
    expect(screen.queryByText('View on Polymarket')).toBeNull();
  });
});
