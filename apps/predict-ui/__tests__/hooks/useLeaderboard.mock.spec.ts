import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useLeaderboard } from '../../src/hooks/useLeaderboard';

jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  devMock: <T>(fn: () => T) => fn(),
  delay: <T>(value: T) => Promise.resolve(value),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLeaderboard – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns the mock rank for the window without calling fetch', async () => {
    const { result } = renderHook(() => useLeaderboard({ window: '30d' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.window).toBe('30d');
    expect(result.current.data?.status).toBe('ranked');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
