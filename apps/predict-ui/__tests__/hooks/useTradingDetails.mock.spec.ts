import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useTradingDetails } from '../../src/hooks/useTradingDetails';
import { mockTradingDetails } from '../../src/mocks/mockTradingDetails';

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

describe('useTradingDetails – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock trading details without calling fetch', async () => {
    const { result } = renderHook(() => useTradingDetails(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual(mockTradingDetails));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
