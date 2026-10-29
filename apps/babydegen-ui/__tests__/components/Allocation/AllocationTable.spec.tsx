import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { AllocationTable } from '../../../src/components/Allocation/AllocationTable';

jest.mock('../../../src/hooks/usePortfolio');

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

let queryClient: QueryClient;
beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

describe('AllocationTable', () => {
  it('shows loading state when isLoading=true', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<AllocationTable />, { wrapper });
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<AllocationTable />, { wrapper });
    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('APR')).toBeInTheDocument();
  });

  it('renders a row for each allocation', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [
          { type: 'balancerPool', assets: ['ETH', 'USDC'], details: '0.3% fee', apr: 5 },
          { type: 'velodrome', assets: ['USDC'], details: '0.05% fee', apr: 3 },
        ],
      },
      isLoading: false,
    });
    render(<AllocationTable />, { wrapper });
    expect(screen.getByText('0.3% fee')).toBeInTheDocument();
    expect(screen.getByText('0.05% fee')).toBeInTheDocument();
  });

  it('renders APR values with % suffix', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [{ type: 'balancerPool', assets: ['ETH'], details: 'detail', apr: 7.5 }],
      },
      isLoading: false,
    });
    render(<AllocationTable />, { wrapper });
    expect(screen.getByText('7.5%')).toBeInTheDocument();
  });

  it('renders empty table when allocations is undefined', () => {
    usePortfolio.mockReturnValue({ data: {}, isLoading: false });
    const { container } = render(<AllocationTable />, { wrapper });
    // Table renders with no rows
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /detail/ })).toBeNull();
  });

  it('keeps legacy velodrome branding and shows Aero only for aero rows', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [
          { type: 'velodrome', assets: ['USDC', 'VELO'], details: 'Velodrome CL Pool', apr: 3 },
          { type: 'aero', assets: ['WETH', 'USDC'], details: 'Aero CL Pool', apr: 4 },
        ],
      },
      isLoading: false,
    });
    const { container } = render(<AllocationTable />, { wrapper });
    expect(screen.getByText('Velodrome CL Pool')).toBeInTheDocument();
    expect(screen.getByText('Aero CL Pool')).toBeInTheDocument();
    const protocolLogos = Array.from(
      container.querySelectorAll('.ant-avatar img[src^="/logos/protocols/"]'),
    ).map((img) => img.getAttribute('src'));
    expect(protocolLogos).toEqual(['/logos/protocols/velodrome.png', '/logos/protocols/aero.png']);
  });
});
