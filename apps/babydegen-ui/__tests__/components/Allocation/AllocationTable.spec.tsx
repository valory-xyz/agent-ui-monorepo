import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { AllocationTable } from '../../../src/components/Allocation/AllocationTable';

jest.mock('../../../src/hooks/usePortfolio');

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('AllocationTable', () => {
  it('shows loading state when isLoading=true', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<AllocationTable />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-spin')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<AllocationTable />, { wrapper: createWrapper() });
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
    render(<AllocationTable />, { wrapper: createWrapper() });
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
    render(<AllocationTable />, { wrapper: createWrapper() });
    expect(screen.getByText('7.5%')).toBeInTheDocument();
  });

  it('renders empty table when allocations is undefined', () => {
    usePortfolio.mockReturnValue({ data: {}, isLoading: false });
    const { container } = render(<AllocationTable />, { wrapper: createWrapper() });
    // Table renders with no rows
    expect(container.querySelector('.ant-table')).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /detail/ })).toBeNull();
  });
});
