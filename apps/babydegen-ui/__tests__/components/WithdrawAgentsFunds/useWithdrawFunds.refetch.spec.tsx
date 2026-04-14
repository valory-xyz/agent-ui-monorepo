import { renderHook } from '@testing-library/react';

import { useWithdrawFunds } from '../../../src/components/WithdrawAgentsFunds/useWithdrawFunds';

type MutationConfig = {
  mutationFn: (targetAddress: `0x${string}`) => Promise<unknown>;
  onError: (error: unknown) => void;
};

type QueryConfig = {
  enabled: boolean;
  queryFn: () => Promise<unknown>;
  refetchInterval: (query: { state: { data?: { status?: string } } }) => number | false;
  retryDelay: (attempt: number) => number;
};

const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: (config: MutationConfig) => mockUseMutation(config),
  useQuery: (config: QueryConfig) => mockUseQuery(config),
}));

describe('useWithdrawFunds refetch behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue({ isPending: false, isError: false, mutateAsync: jest.fn() });
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false });
  });

  it('keeps polling for non-completed statuses and stops when completed', () => {
    let capturedQueryConfig: QueryConfig | undefined;
    mockUseQuery.mockImplementation((config: QueryConfig) => {
      capturedQueryConfig = config;
      return { data: undefined, isLoading: false, isError: false };
    });

    renderHook(() => useWithdrawFunds());

    if (!capturedQueryConfig) throw new Error('Expected query config to be captured');

    expect(capturedQueryConfig.enabled).toBe(false);
    expect(capturedQueryConfig.refetchInterval({ state: { data: { status: 'processing' } } })).toBe(
      2000,
    );
    expect(capturedQueryConfig.refetchInterval({ state: { data: { status: 'completed' } } })).toBe(
      false,
    );
  });

  it('queryFn throws when withdrawId is null (defensive guard)', async () => {
    let capturedQueryConfig: QueryConfig | undefined;
    mockUseQuery.mockImplementation((config: QueryConfig) => {
      capturedQueryConfig = config;
      return { data: undefined, isLoading: false, isError: false };
    });

    renderHook(() => useWithdrawFunds());

    if (!capturedQueryConfig) throw new Error('Expected query config to be captured');

    // Call queryFn directly — withdrawId is null at this point (initial state)
    await expect(capturedQueryConfig.queryFn()).rejects.toThrow(
      'Withdrawal ID is required to fetch status.',
    );
  });

  it('retryDelay uses exponential backoff capped at 30000ms', () => {
    let capturedQueryConfig: QueryConfig | undefined;
    mockUseQuery.mockImplementation((config: QueryConfig) => {
      capturedQueryConfig = config;
      return { data: undefined, isLoading: false, isError: false };
    });

    renderHook(() => useWithdrawFunds());

    if (!capturedQueryConfig) throw new Error('Expected query config to be captured');

    // attempt 0 → 1000 * 2^0 = 1000
    expect(capturedQueryConfig.retryDelay(0)).toBe(1000);
    // attempt 5 → 1000 * 2^5 = 32000 → capped at 30000
    expect(capturedQueryConfig.retryDelay(5)).toBe(30000);
  });
});
