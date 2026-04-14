import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { usePositionDetails, useTradeHistory } from '../../src/hooks/useTradeHistory';
import { mockPositionDetails, mockTradeHistory } from '../../src/mocks/mockTradeHistory';

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

describe('useTradeHistory – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock trade history without calling fetch', async () => {
    const { result } = renderHook(() => useTradeHistory({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual(mockTradeHistory));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('usePositionDetails – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock position details without calling fetch', async () => {
    const { result } = renderHook(() => usePositionDetails({ id: 'test-id' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual(mockPositionDetails));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
