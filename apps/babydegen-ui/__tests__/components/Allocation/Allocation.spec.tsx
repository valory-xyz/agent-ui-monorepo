import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Allocation } from '../../../src/components/Allocation/Allocation';

jest.mock('../../../src/hooks/usePortfolio');

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

describe('Allocation', () => {
  it('renders Allocation title', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<Allocation />, { wrapper: createWrapper() });
    expect(screen.getByText('Allocation')).toBeTruthy();
  });

  it('renders without crashing', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    expect(() => render(<Allocation />, { wrapper: createWrapper() })).not.toThrow();
  });
});
