import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { useAgentDetails } from '../../src/hooks/useAgentDetails';
import { mockAgentDetails } from '../../src/mocks/mockAgentDetails';
import { mockPerformance } from '../../src/mocks/mockPerformance';

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

describe('useAgentDetails – dev mock mode', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => jest.restoreAllMocks());

  it('returns mock agent details and performance without calling fetch', async () => {
    const { result } = renderHook(() => useAgentDetails(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data.agentDetails).toEqual(mockAgentDetails));
    await waitFor(() => expect(result.current.data.performance).toEqual(mockPerformance));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
