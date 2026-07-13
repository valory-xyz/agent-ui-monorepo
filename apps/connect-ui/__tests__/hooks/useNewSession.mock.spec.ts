import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useNewSession } from '../../src/hooks/useNewSession';
import { mockSessionResponse } from '../../src/mocks/mockSettings';

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

describe('useNewSession – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns the mock response without calling fetch', async () => {
    const { result } = renderHook(() => useNewSession(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.data).toEqual(mockSessionResponse));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
