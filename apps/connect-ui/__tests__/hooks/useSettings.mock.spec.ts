import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useSettings } from '../../src/hooks/useSettings';
import { getMockSettings } from '../../src/mocks/mockSettings';

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

describe('useSettings – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock settings without calling fetch', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(getMockSettings()));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
