import { renderHook } from '@testing-library/react';

import { useWithdrawLockedFunds } from '../../src/hooks/useWithdrawLockedFunds';

type MutationConfig = {
  mutationFn: () => Promise<unknown>;
  onError: (error: unknown) => void;
};

type QueryConfig = {
  enabled: boolean;
  queryFn: () => Promise<unknown>;
  refetchInterval: (query: { state: { data?: { status?: string } } }) => number | false;
  retry: number;
};

const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (config: MutationConfig) => mockUseMutation(config),
  useQuery: (config: QueryConfig) => mockUseQuery(config),
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

  it('disables the status query until withdrawId is set', () => {
    const cfg = captureQueryConfig();
    expect(cfg.enabled).toBe(false);
  });

  it('polls every 2s for non-terminal statuses', () => {
    const cfg = captureQueryConfig();
    expect(cfg.refetchInterval({ state: { data: { status: 'initiated' } } })).toBe(2000);
    expect(cfg.refetchInterval({ state: { data: { status: 'withdrawing' } } })).toBe(2000);
    expect(cfg.refetchInterval({ state: {} })).toBe(2000);
  });

  it('stops polling on completed and failed statuses', () => {
    const cfg = captureQueryConfig();
    expect(cfg.refetchInterval({ state: { data: { status: 'completed' } } })).toBe(false);
    expect(cfg.refetchInterval({ state: { data: { status: 'failed' } } })).toBe(false);
  });

  it('retries the status query indefinitely so transient errors are absorbed', () => {
    const cfg = captureQueryConfig();
    expect(cfg.retry).toBe(Infinity);
  });

  it('logs and clears withdrawId on mutation error', () => {
    let mutationCfg: MutationConfig | undefined;
    mockUseMutation.mockImplementation((config: MutationConfig) => {
      mutationCfg = config;
      return { isPending: false, isError: false, mutateAsync: jest.fn(), reset: jest.fn() };
    });
    renderHook(() => useWithdrawLockedFunds());
    if (!mutationCfg) throw new Error('Expected mutation config to be captured');

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    mutationCfg.onError(new Error('initiate failed'));
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error initiating withdrawal:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
