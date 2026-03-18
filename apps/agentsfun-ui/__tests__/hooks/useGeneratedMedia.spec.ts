import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockMedia } from '../../src/mocks';
import { GeneratedMedia } from '../../src/types';

type GeneratedMediaQueryConfig = {
  queryKey: string[];
  queryFn: () => Promise<GeneratedMedia[] | null>;
  retry: number | boolean;
  retryDelay: (attempt: number) => number;
  refetchInterval: number;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: GeneratedMediaQueryConfig) => mockUseQuery(config),
}));

const loadHook = () =>
  require('../../src/hooks/useGeneratedMedia') as typeof import('../../src/hooks/useGeneratedMedia');

describe('useGeneratedMedia (agentsfun-ui)', () => {
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

  it('queries the live media endpoint', async () => {
    let capturedConfig: GeneratedMediaQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: GeneratedMediaQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMedia),
    });

    const { useGeneratedMedia } = loadHook();
    useGeneratedMedia();

    if (!capturedConfig) throw new Error('Query config was not captured');

    expect(capturedConfig.queryKey).toEqual(['xMediaActivity']);
    expect(capturedConfig.retry).toBe(5);
    expect(capturedConfig.retryDelay(5)).toBe(30000);
    expect(capturedConfig.refetchInterval).toBe(FORTYFIVE_SECONDS);

    await expect(capturedConfig.queryFn()).resolves.toEqual(mockMedia);
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL}/media`);
  });

  it('throws when the media endpoint fails', async () => {
    let capturedConfig: GeneratedMediaQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: GeneratedMediaQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { useGeneratedMedia } = loadHook();
    useGeneratedMedia();

    if (!capturedConfig) throw new Error('Query config was not captured');
    await expect(capturedConfig.queryFn()).rejects.toThrow('Failed to fetch generated media');
  });

  it('returns the mock media list in mock mode', async () => {
    jest.useFakeTimers();
    process.env.IS_MOCK_ENABLED = 'true';
    jest.resetModules();

    let capturedConfig: GeneratedMediaQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: GeneratedMediaQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: mockMedia };
    });

    const { useGeneratedMedia } = loadHook();
    useGeneratedMedia();

    if (!capturedConfig) throw new Error('Query config was not captured');

    const pendingResult = capturedConfig.queryFn();
    jest.advanceTimersByTime(2000);

    await expect(pendingResult).resolves.toEqual(mockMedia);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
