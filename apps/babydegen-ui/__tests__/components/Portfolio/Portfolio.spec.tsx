import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Portfolio } from '../../../src/components/Portfolio/Portfolio';

jest.mock('../../../src/hooks/usePortfolio');
jest.mock('../../../src/components/Portfolio/BreakdownModal', () => ({
  BreakdownModal: ({ open, onCancel }: { open: boolean; onCancel: () => void }) =>
    open ? (
      <div data-testid="breakdown-modal">
        <button onClick={onCancel}>Close breakdown</button>
      </div>
    ) : null,
}));

const { usePortfolio } = jest.requireMock('../../../src/hooks/usePortfolio') as {
  usePortfolio: jest.Mock;
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Portfolio', () => {
  it('renders Portfolio title', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<Portfolio />, { wrapper: createWrapper() });
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<Portfolio />, { wrapper: createWrapper() });
    expect(container.querySelector('.ant-skeleton-input')).toBeInTheDocument();
  });

  it('renders portfolio balance from data', () => {
    usePortfolio.mockReturnValue({
      data: { portfolio_value: 1234.56, total_roi: 5.5, partial_roi: null },
      isLoading: false,
    });
    render(<Portfolio />, { wrapper: createWrapper() });
    expect(screen.getByText('1,234.56')).toBeInTheDocument();
  });

  it('renders ROI from data', () => {
    usePortfolio.mockReturnValue({
      data: { portfolio_value: 1000, total_roi: 12, partial_roi: null },
      isLoading: false,
    });
    render(<Portfolio />, { wrapper: createWrapper() });
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders See breakdown button', () => {
    usePortfolio.mockReturnValue({
      data: { portfolio_value: 1000, total_roi: 5, partial_roi: null },
      isLoading: false,
    });
    render(<Portfolio />, { wrapper: createWrapper() });
    expect(screen.getByText('See breakdown')).toBeInTheDocument();
  });

  it('See breakdown button is disabled when portfolio_value is not a number', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<Portfolio />, { wrapper: createWrapper() });
    const btn = screen.getByText('See breakdown').closest('button');
    expect(btn).toBeInTheDocument();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders RoiTooltip info icon when partial_roi is provided', () => {
    usePortfolio.mockReturnValue({
      data: { portfolio_value: 1000, total_roi: 10, partial_roi: 7.5 },
      isLoading: false,
    });
    const { container } = render(<Portfolio />, { wrapper: createWrapper() });
    expect(container.querySelector('[aria-label="info-circle"]')).toBeInTheDocument();
  });

  it('opens BreakdownModal when See breakdown button is clicked', () => {
    usePortfolio.mockReturnValue({
      data: { portfolio_value: 1000, total_roi: 5, partial_roi: null },
      isLoading: false,
    });
    render(<Portfolio />, { wrapper: createWrapper() });
    const btn = screen.getByText('See breakdown');
    fireEvent.click(btn);
    expect(screen.getByTestId('breakdown-modal')).toBeInTheDocument();
  });

  it('closes BreakdownModal when onCancel is called', () => {
    usePortfolio.mockReturnValue({
      data: { portfolio_value: 1000, total_roi: 5, partial_roi: null },
      isLoading: false,
    });
    render(<Portfolio />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByText('See breakdown'));
    expect(screen.getByTestId('breakdown-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close breakdown'));
    expect(screen.queryByTestId('breakdown-modal')).not.toBeInTheDocument();
  });
});
