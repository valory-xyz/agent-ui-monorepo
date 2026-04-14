import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockPerformanceSummary } from '../../src/mocks';
import { PerformanceSummary } from '../../src/types';

type PerformanceQueryConfig = {
  queryKey: string[];
  queryFn: () => Promise<PerformanceSummary | null>;
  retry: number | boolean;
  retryDelay: (attempt: number) => number;
  refetchInterval: number;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: PerformanceQueryConfig) => mockUseQuery(config),
}));

const loadHook = () =>
  require('../../src/hooks/usePerformance') as typeof import('../../src/hooks/usePerformance');

describe('usePerformance (agentsfun-ui)', () => {
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

  it('maps metric values and tooltips from query data', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockPerformanceSummary,
    });

    const { usePerformance } = loadHook();
    const result = usePerformance();

    expect(result.weeklyImpressions).toBe(979);
    expect(result.weeklyLikes).toBe(12);
    expect(result.impressionsTooltip).toContain('Total number of times');
    expect(result.likesTooltip).toContain('Total number of times users tapped');
  });

  it('falls back to zero values when metrics are missing', () => {
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...mockPerformanceSummary, metrics: [] },
    });

    const { usePerformance } = loadHook();
    const result = usePerformance();

    expect(result.weeklyImpressions).toBe(0);
    expect(result.weeklyLikes).toBe(0);
    expect(result.impressionsTooltip).toBeUndefined();
    expect(result.likesTooltip).toBeUndefined();
  });

  it('queries the live performance endpoint with the expected settings', async () => {
    let capturedConfig: PerformanceQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: PerformanceQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPerformanceSummary),
    });

    const { usePerformance } = loadHook();
    usePerformance();

    if (!capturedConfig) throw new Error('Query config was not captured');

    expect(capturedConfig.queryKey).toEqual(['performanceSummary']);
    expect(capturedConfig.retry).toBe(5);
    expect(capturedConfig.retryDelay(5)).toBe(30000);
    expect(capturedConfig.refetchInterval).toBe(FORTYFIVE_SECONDS);

    await expect(capturedConfig.queryFn()).resolves.toEqual(mockPerformanceSummary);
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL}/performance-summary`);
  });

  it('throws when the performance endpoint returns ok=false', async () => {
    let capturedConfig: PerformanceQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: PerformanceQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { usePerformance } = loadHook();
    usePerformance();

    if (!capturedConfig) throw new Error('Query config was not captured');
    await expect(capturedConfig.queryFn()).rejects.toThrow('Failed to fetch performance summary');
  });

  it('returns the mock performance summary in mock mode', async () => {
    jest.useFakeTimers();
    process.env.IS_MOCK_ENABLED = 'true';
    jest.resetModules();

    let capturedConfig: PerformanceQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: PerformanceQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false, data: mockPerformanceSummary };
    });

    const { usePerformance } = loadHook();
    usePerformance();

    if (!capturedConfig) throw new Error('Query config was not captured');

    const pendingResult = capturedConfig.queryFn();
    jest.advanceTimersByTime(2000);

    await expect(pendingResult).resolves.toEqual(mockPerformanceSummary);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
