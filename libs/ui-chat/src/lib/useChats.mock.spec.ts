import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useChats } from './useChats';

jest.mock('@agent-ui-monorepo/util-functions', () => ({
  ...jest.requireActual('@agent-ui-monorepo/util-functions'),
  devMock: <T>(fn: () => T) => fn(),
  delay: <T>(value: T) => Promise.resolve(value),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useChats (IS_MOCK_ENABLED=true path)', () => {
  it('resolves with mockChat and does not call fetch', async () => {
    global.fetch = jest.fn();
    const mockData = { result: 'mock-result' };

    const { result } = renderHook(() => useChats(mockData), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('hello');
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
    expect(global.fetch).not.toHaveBeenCalled();

    const g = global as unknown as Record<string, unknown>;
    delete g['fetch'];
  });
});
