import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useUpdateSettings } from '../../src/hooks/useUpdateSettings';

jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  devMock: <T>(fn: () => T) => fn(),
  delay: <T>(value: T) => Promise.resolve(value),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUpdateSettings – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('applies the patch to the stateful mock without calling fetch', async () => {
    const { result } = renderHook(() => useUpdateSettings(), { wrapper: createWrapper() });

    result.current.mutate({
      password: 'anything',
      protected: { mode: 'unrestricted' },
      harness: 'claude_code_cli',
    });

    await waitFor(() => expect(result.current.data?.protected.mode).toBe('unrestricted'));
    expect(result.current.data?.harness).toBe('claude_code_cli');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
