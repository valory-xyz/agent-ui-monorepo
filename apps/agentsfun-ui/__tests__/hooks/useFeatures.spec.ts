import { FIVE_MINUTES, FIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockFeatures } from '../../src/mocks';

type FeaturesResponse = { isChatEnabled: boolean };
type FeaturesQueryConfig = {
  queryKey: string[];
  queryFn: () => Promise<FeaturesResponse>;
  refetchInterval: (query: { state: { data?: FeaturesResponse } }) => number;
  retry: number | boolean;
  retryDelay: (attempt: number) => number;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: FeaturesQueryConfig) => mockUseQuery(config),
}));

const loadHook = () =>
  require('../../src/hooks/useFeatures') as typeof import('../../src/hooks/useFeatures');

describe('useFeatures (agentsfun-ui)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.resetModules();
    process.env.IS_MOCK_ENABLED = 'false';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    const globalScope = global as unknown as Record<string, unknown>;
    delete globalScope.fetch;
    jest.useRealTimers();
  });

  it('configures the live query with retry and refetch behavior', async () => {
    let capturedConfig: FeaturesQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: FeaturesQueryConfig) => {
      capturedConfig = config;
      return { isLoading: true };
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ isChatEnabled: true }),
    });

    const { useFeatures } = loadHook();
    useFeatures();

    if (!capturedConfig) throw new Error('Query config was not captured');

    expect(capturedConfig.queryKey).toEqual(['features']);
    expect(capturedConfig.retry).toBe(Infinity);
    expect(capturedConfig.retryDelay(5)).toBe(30000);
    expect(capturedConfig.refetchInterval({ state: { data: { isChatEnabled: true } } })).toBe(
      FIVE_MINUTES,
    );
    expect(capturedConfig.refetchInterval({ state: { data: { isChatEnabled: false } } })).toBe(
      FIVE_SECONDS,
    );

    await expect(capturedConfig.queryFn()).resolves.toEqual({ isChatEnabled: true });
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL}/features`);
  });

  it('throws when the live endpoint responds with ok=false', async () => {
    let capturedConfig: FeaturesQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: FeaturesQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false };
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { useFeatures } = loadHook();
    useFeatures();

    if (!capturedConfig) throw new Error('Query config was not captured');
    await expect(capturedConfig.queryFn()).rejects.toThrow('Failed to fetch features');
  });

  it('returns the mock data when mock mode is enabled', async () => {
    jest.useFakeTimers();
    process.env.IS_MOCK_ENABLED = 'true';
    jest.resetModules();

    let capturedConfig: FeaturesQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: FeaturesQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, data: mockFeatures };
    });

    const { useFeatures } = loadHook();
    useFeatures();

    if (!capturedConfig) throw new Error('Query config was not captured');

    const pendingResult = capturedConfig.queryFn();
    jest.advanceTimersByTime(2000);

    await expect(pendingResult).resolves.toEqual(mockFeatures);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
