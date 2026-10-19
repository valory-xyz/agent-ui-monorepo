import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import App from '../src/App';

// Mock all heavy components to prevent deep dependency chains
jest.mock('../src/components/Portfolio/Portfolio', () => ({
  Portfolio: () => <div>Portfolio</div>,
}));

jest.mock('../src/components/Allocation/Allocation', () => ({
  Allocation: () => <div>Allocation</div>,
}));

jest.mock('../src/components/Strategy/Strategy', () => ({
  Strategy: () => <div>Strategy</div>,
}));

jest.mock('../src/components/WithdrawAgentsFunds/WithdrawAgentsFunds', () => ({
  WithdrawAgentsFunds: () => <div>WithdrawAgentsFunds</div>,
}));

jest.mock('@agent-ui-monorepo/ui-theme', () => ({
  GlobalStyles: () => null,
}));

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};

describe('App (babydegen-ui)', () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ isChatEnabled: false }),
  });

  beforeEach(() => {
    fetchMock.mockClear();
    global.fetch = fetchMock;
  });

  it('renders every section, with Strategy shown without a chat gate', () => {
    renderApp();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Allocation')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
    expect(screen.getByText('WithdrawAgentsFunds')).toBeInTheDocument();
  });

  it("does not render the chat (Update agent's goal) section or fetch its features", () => {
    renderApp();
    expect(screen.queryByText("Update agent's goal")).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => url)).not.toContainEqual(
      expect.stringContaining('/features'),
    );
  });
});
