import { renderHook } from '@testing-library/react';

import { useWithdrawLockedFunds } from '../../src/hooks/useWithdrawLockedFunds';

type MutationConfig = {
  mutationFn: () => Promise<unknown>;
  onSuccess: (data: unknown) => void;
  onError: (error: unknown) => void;
};

type QueryConfig = {
  enabled: boolean;
  queryFn: () => Promise<unknown>;
  refetchInterval: (query: { state: { data?: { mode?: string } } }) => number | false;
  retry: number;
};

const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();
const mockSetQueryData = jest.fn();
const mockRefetchQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (config: MutationConfig) => mockUseMutation(config),
  useQuery: (config: QueryConfig) => mockUseQuery(config),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    refetchQueries: mockRefetchQueries,
  }),
}));

describe('useWithdrawLockedFunds — query/mutation config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue({
      isPending: false,
      isError: false,
      mutateAsync: jest.fn(),
      reset: jest.fn(),
    });
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });
  });

  const captureQueryConfig = () => {
    let captured: QueryConfig | undefined;
    mockUseQuery.mockImplementation((config: QueryConfig) => {
      captured = config;
      return { data: undefined, isLoading: false, isError: false };
    });
    renderHook(() => useWithdrawLockedFunds());
    if (!captured) throw new Error('Expected query config to be captured');
    return captured;
  };

  it('keeps the status query disabled until the user initiates', () => {
    const cfg = captureQueryConfig();
    expect(cfg.enabled).toBe(false);
  });

  it('polls every 2s while the agent is armed or selling', () => {
    const cfg = captureQueryConfig();
    expect(cfg.refetchInterval({ state: { data: { mode: 'armed' } } })).toBe(2000);
    expect(cfg.refetchInterval({ state: { data: { mode: 'selling' } } })).toBe(2000);
  });

  it('stops polling when idle, complete, or errored', () => {
    const cfg = captureQueryConfig();
    expect(cfg.refetchInterval({ state: { data: { mode: 'idle' } } })).toBe(false);
    expect(cfg.refetchInterval({ state: { data: { mode: 'complete' } } })).toBe(false);
    expect(cfg.refetchInterval({ state: { data: { mode: 'errored' } } })).toBe(false);
    expect(cfg.refetchInterval({ state: {} })).toBe(false);
  });

  it('retries the status query indefinitely so transient errors are absorbed', () => {
    const cfg = captureQueryConfig();
    expect(cfg.retry).toBe(Infinity);
  });

  it('refetches the agent performance query when the sweep reaches complete', () => {
    mockUseQuery.mockReturnValue({
      data: { mode: 'complete' },
      isLoading: false,
      isError: false,
    });
    renderHook(() => useWithdrawLockedFunds());

    expect(mockRefetchQueries).toHaveBeenCalledWith({ queryKey: ['agentPerformance'] });
  });

  it('refetches the agent performance query when the sweep reaches errored', () => {
    mockUseQuery.mockReturnValue({
      data: { mode: 'errored' },
      isLoading: false,
      isError: false,
    });
    renderHook(() => useWithdrawLockedFunds());

    expect(mockRefetchQueries).toHaveBeenCalledWith({ queryKey: ['agentPerformance'] });
  });

  it('does NOT refetch the agent performance query for non-terminal modes', () => {
    mockUseQuery.mockReturnValue({
      data: { mode: 'selling' },
      isLoading: false,
      isError: false,
    });
    renderHook(() => useWithdrawLockedFunds());

    expect(mockRefetchQueries).not.toHaveBeenCalled();
  });

  it('logs on mutation error', () => {
    let mutationCfg: MutationConfig | undefined;
    mockUseMutation.mockImplementation((config: MutationConfig) => {
      mutationCfg = config;
      return { isPending: false, isError: false, mutateAsync: jest.fn(), reset: jest.fn() };
    });
    renderHook(() => useWithdrawLockedFunds());
    if (!mutationCfg) throw new Error('Expected mutation config to be captured');

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    mutationCfg.onError(new Error('arm failed'));
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error arming withdrawal:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
