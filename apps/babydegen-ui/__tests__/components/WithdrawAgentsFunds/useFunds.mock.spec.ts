import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useFunds } from '../../../src/components/WithdrawAgentsFunds/useFunds';
import { mockFunds } from '../../../src/mocks/mockFundsWithdrawal';

jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  devMock: <T>(fn: () => T) => fn(),
  delay: <T>(value: T) => Promise.resolve(value),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFunds – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock funds without calling fetch', async () => {
    const { result } = renderHook(() => useFunds(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual(mockFunds));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
