import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createElement } from 'react';

import { AllocationPie } from '../../../src/components/Allocation/AllocationPie';

jest.mock('../../../src/hooks/usePortfolio');

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

// Doughnut from react-chartjs-2 uses Canvas which isn't available in jsdom
jest.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }: { data: { labels: string[]; datasets: { data: number[] }[] } }) => (
    <div data-testid="doughnut-chart" data-labels={JSON.stringify(data.labels)} />
  ),
}));

// DonutCenterLogoPlugin references canvas — mock it
jest.mock('../../../src/utils/chartjs/donut-center-plugin', () => ({
  DonutCenterLogoPlugin: {},
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('AllocationPie', () => {
  it('renders loading skeleton when isLoading=true', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<AllocationPie />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
  });

  it('renders Doughnut chart when data is available', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [
          {
            type: 'balancerPool',
            ratio: 0.6,
            assets: ['ETH', 'USDC'],
            details: '0.3% fee',
            apr: 5,
          },
          { type: 'velodrome', ratio: 0.4, assets: ['USDC'], details: '0.05% fee', apr: 3 },
        ],
      },
      isLoading: false,
    });
    const { getByTestId } = render(<AllocationPie />, { wrapper: createWrapper() });
    const chart = getByTestId('doughnut-chart');
    expect(chart).toBeInTheDocument();
    const raw = chart.getAttribute('data-labels');
    if (!raw) throw new Error('data-labels attribute missing');
    expect(JSON.parse(raw)).toEqual(['balancerPool', 'velodrome']);
  });

  it('renders Doughnut with empty/fallback data when allocations is null', () => {
    usePortfolio.mockReturnValue({ data: { allocations: null }, isLoading: false });
    const { getByTestId } = render(<AllocationPie />, { wrapper: createWrapper() });
    // Falls back to emptyChartData — chart still rendered
    const chart1 = getByTestId('doughnut-chart');
    expect(chart1).toBeInTheDocument();
    const labels1 = chart1.getAttribute('data-labels');
    if (!labels1) throw new Error('data-labels attribute missing');
    expect(JSON.parse(labels1)).toEqual([]);
  });

  it('renders Doughnut with fallback data when data is null', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    const { getByTestId } = render(<AllocationPie />, { wrapper: createWrapper() });
    const chart2 = getByTestId('doughnut-chart');
    expect(chart2).toBeInTheDocument();
    const labels2 = chart2.getAttribute('data-labels');
    if (!labels2) throw new Error('data-labels attribute missing');
    expect(JSON.parse(labels2)).toEqual([]);
  });

  it('renders Doughnut with fallback when allocation ratio is not a number (invalid data)', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [
          { type: 'balancerPool', ratio: 'invalid', assets: ['ETH'], details: '', apr: 0 },
        ],
      },
      isLoading: false,
    });
    const { getByTestId } = render(<AllocationPie />, { wrapper: createWrapper() });
    // hasValidAllocations = false → emptyChartData
    const chart3 = getByTestId('doughnut-chart');
    const labels3 = chart3.getAttribute('data-labels');
    if (!labels3) throw new Error('data-labels attribute missing');
    expect(JSON.parse(labels3)).toEqual([]);
  });

  it('renders Doughnut with fallback when allocations is not an array', () => {
    usePortfolio.mockReturnValue({
      data: { allocations: 'not-an-array' as unknown as [] },
      isLoading: false,
    });
    const { getByTestId } = render(<AllocationPie />, { wrapper: createWrapper() });
    const chart = getByTestId('doughnut-chart');
    const labels = chart.getAttribute('data-labels');
    if (!labels) throw new Error('data-labels attribute missing');
    expect(JSON.parse(labels)).toEqual([]);
  });

  it('chart labels match allocation types for valid data', () => {
    usePortfolio.mockReturnValue({
      data: {
        allocations: [
          { type: 'balancerPool', ratio: 0.5, assets: ['ETH'], details: '', apr: 0 },
          { type: 'sturdy', ratio: 0.5, assets: ['USDC'], details: '', apr: 0 },
        ],
      },
      isLoading: false,
    });
    const { getByTestId } = render(<AllocationPie />, { wrapper: createWrapper() });
    const raw = getByTestId('doughnut-chart').getAttribute('data-labels');
    if (!raw) throw new Error('data-labels attribute missing');
    expect(JSON.parse(raw)).toEqual(['balancerPool', 'sturdy']);
  });
});
