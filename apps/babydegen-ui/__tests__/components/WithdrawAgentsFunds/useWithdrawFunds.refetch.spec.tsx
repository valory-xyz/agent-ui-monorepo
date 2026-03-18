import { renderHook } from '@testing-library/react';

import { useWithdrawFunds } from '../../../src/components/WithdrawAgentsFunds/useWithdrawFunds';

type MutationConfig = {
  mutationFn: (targetAddress: `0x${string}`) => Promise<unknown>;
  onError: (error: unknown) => void;
};

type QueryConfig = {
  enabled: boolean;
  refetchInterval: (query: { state: { data?: { status?: string } } }) => number | false;
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
});
