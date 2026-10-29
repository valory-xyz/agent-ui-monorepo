import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

jest.mock('../../../src/hooks/usePortfolio');

// agentMap.ts reads process.env at module load time, so the component (and
// agentMap behind it) is required only after the env is set to basius.
process.env.REACT_APP_AGENT_NAME = 'basius';
const { AllocationTable } = require('../../../src/components/Allocation/AllocationTable');

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

let queryClient: QueryClient;
beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

describe('AllocationTable (basius)', () => {
  it('shows legacy pools as Aerodrome and merged pools as Aero', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [
          { type: 'velodrome', assets: ['WETH', 'USDC'], details: 'Velodrome CL Pool', apr: 3 },
          { type: 'aerodrome', assets: ['WETH', 'USDC'], details: 'Aerodrome Pool', apr: 5 },
          { type: 'aero', assets: ['WETH', 'USDC'], details: 'Aero CL Pool', apr: 4 },
        ],
      },
      isLoading: false,
    });
    const { container } = render(<AllocationTable />, { wrapper });
    expect(screen.getByText('Aerodrome CL Pool')).toBeInTheDocument();
    expect(screen.getByText('Aerodrome Pool')).toBeInTheDocument();
    expect(screen.getByText('Aero CL Pool')).toBeInTheDocument();
    expect(screen.queryByText(/velodrome/i)).toBeNull();
    const protocolLogos = Array.from(
      container.querySelectorAll('.ant-avatar img[src^="/logos/protocols/"]'),
    ).map((img) => img.getAttribute('src'));
    expect(protocolLogos).toEqual([
      '/logos/protocols/aerodrome.png',
      '/logos/protocols/aerodrome.png',
      '/logos/protocols/aero.png',
    ]);
  });
});
