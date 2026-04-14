import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockXActivity } from '../../src/mocks';
import { XActivity } from '../../src/types';

type XActivityQueryConfig = {
  queryKey: string[];
  queryFn: () => Promise<XActivity | null>;
  retry: number | boolean;
  retryDelay: (attempt: number) => number;
  refetchInterval: number;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: XActivityQueryConfig) => mockUseQuery(config),
}));

const loadHook = () =>
  require('../../src/hooks/useXActivity') as typeof import('../../src/hooks/useXActivity');

describe('useXActivity (agentsfun-ui)', () => {
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

  it('queries the live x-activity endpoint with retry settings', async () => {
    let capturedConfig: XActivityQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: XActivityQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockXActivity),
    });

    const { useXActivity } = loadHook();
    useXActivity();

    if (!capturedConfig) throw new Error('Query config was not captured');

    expect(capturedConfig.queryKey).toEqual(['xActivity']);
    expect(capturedConfig.retry).toBe(5);
    expect(capturedConfig.retryDelay(5)).toBe(30000);
    expect(capturedConfig.refetchInterval).toBe(FORTYFIVE_SECONDS);

    await expect(capturedConfig.queryFn()).resolves.toEqual(mockXActivity);
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL}/x-activity`);
  });

  it('throws when the x-activity endpoint fails', async () => {
    let capturedConfig: XActivityQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: XActivityQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { useXActivity } = loadHook();
    useXActivity();

    if (!capturedConfig) throw new Error('Query config was not captured');
    await expect(capturedConfig.queryFn()).rejects.toThrow('Failed to fetch X activity');
  });

  it('returns the mock x-activity in mock mode', async () => {
    jest.useFakeTimers();
    process.env.IS_MOCK_ENABLED = 'true';
    jest.resetModules();

    let capturedConfig: XActivityQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: XActivityQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: mockXActivity };
    });

    const { useXActivity } = loadHook();
    useXActivity();

    if (!capturedConfig) throw new Error('Query config was not captured');

    const pendingResult = capturedConfig.queryFn();
    jest.advanceTimersByTime(2000);

    await expect(pendingResult).resolves.toEqual(mockXActivity);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
