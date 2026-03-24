import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import { Allocation } from '../../../src/components/Allocation/Allocation';

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

describe('Allocation', () => {
  it('renders Allocation title', () => {
    usePortfolio.mockReturnValue({ data: null, isLoading: false });
    render(<Allocation />, { wrapper });
    expect(screen.getByText('Allocation')).toBeInTheDocument();
  });
});
