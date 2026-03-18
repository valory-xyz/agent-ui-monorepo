import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockMemecoinActivity } from '../../src/mocks';
import { MemecoinActivity } from '../../src/types';

type MemecoinQueryConfig = {
  queryKey: string[];
  queryFn: () => Promise<MemecoinActivity[] | null>;
  retry: number | boolean;
  retryDelay: (attempt: number) => number;
  refetchInterval: number;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: MemecoinQueryConfig) => mockUseQuery(config),
}));

const loadHook = () =>
  require('../../src/hooks/useMemecoinActivity') as typeof import('../../src/hooks/useMemecoinActivity');

describe('useMemecoinActivity (agentsfun-ui)', () => {
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

  it('queries the live memecoin-activity endpoint', async () => {
    let capturedConfig: MemecoinQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: MemecoinQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMemecoinActivity),
    });

    const { useMemecoinActivity } = loadHook();
    useMemecoinActivity();

    if (!capturedConfig) throw new Error('Query config was not captured');

    expect(capturedConfig.queryKey).toEqual(['xMemecoinActivity']);
    expect(capturedConfig.retry).toBe(5);
    expect(capturedConfig.retryDelay(5)).toBe(30000);
    expect(capturedConfig.refetchInterval).toBe(FORTYFIVE_SECONDS);

    await expect(capturedConfig.queryFn()).resolves.toEqual(mockMemecoinActivity);
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL}/memecoin-activity`);
  });

  it('throws when the memecoin endpoint returns ok=false', async () => {
    let capturedConfig: MemecoinQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: MemecoinQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { useMemecoinActivity } = loadHook();
    useMemecoinActivity();

    if (!capturedConfig) throw new Error('Query config was not captured');
    await expect(capturedConfig.queryFn()).rejects.toThrow('Failed to fetch Memecoin activity');
  });

  it('returns the mock memecoin activity in mock mode', async () => {
    jest.useFakeTimers();
    process.env.IS_MOCK_ENABLED = 'true';
    jest.resetModules();

    let capturedConfig: MemecoinQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: MemecoinQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: mockMemecoinActivity };
    });

    const { useMemecoinActivity } = loadHook();
    useMemecoinActivity();

    if (!capturedConfig) throw new Error('Query config was not captured');

    const pendingResult = capturedConfig.queryFn();
    jest.advanceTimersByTime(2000);

    await expect(pendingResult).resolves.toEqual(mockMemecoinActivity);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
