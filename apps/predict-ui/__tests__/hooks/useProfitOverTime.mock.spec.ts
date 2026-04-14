import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useProfitOverTime } from '../../src/hooks/useProfitOverTime';
import { getMockProfitOverTime } from '../../src/mocks/mockProfitOverTime';

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

describe('useProfitOverTime – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock profit over time for 7d without calling fetch', async () => {
    const { result } = renderHook(() => useProfitOverTime({ window: '7d' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.window).toBe(getMockProfitOverTime('7d').window);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
