type QueryState<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: <T>(...args: unknown[]) => mockUseQuery(...(args as [unknown])) as QueryState<T>,
}));

const loadHook = () =>
  require('../../src/hooks/useAgentDetails') as typeof import('../../src/hooks/useAgentDetails');

describe('useAgentDetails combined state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('returns isError=true when both queries are in an error state', () => {
    mockUseQuery
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: true })
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: true });

    const { useAgentDetails } = loadHook();
    const result = useAgentDetails();

    expect(result.isLoading).toBe(false);
    expect(result.isError).toBe(true);
    expect(result.data.agentDetails).toBeUndefined();
    expect(result.data.performance).toBeUndefined();
  });
});
