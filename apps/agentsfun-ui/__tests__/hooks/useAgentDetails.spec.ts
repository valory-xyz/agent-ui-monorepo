import { FORTYFIVE_SECONDS, LOCAL } from '@agent-ui-monorepo/util-constants-and-types';

import { mockAgentInfo } from '../../src/mocks';
import { AgentInfoResponse } from '../../src/types';

type AgentDetailsQueryConfig = {
  queryKey: string[];
  queryFn: () => Promise<AgentInfoResponse | null>;
  retry: number | boolean;
  retryDelay: (attempt: number) => number;
  refetchInterval: (data: AgentInfoResponse | null) => number;
};

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: AgentDetailsQueryConfig) => mockUseQuery(config),
}));

const loadHook = () =>
  require('../../src/hooks/useAgentDetails') as typeof import('../../src/hooks/useAgentDetails');

describe('useAgentDetails (agentsfun-ui)', () => {
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

  it('queries the live agent-info endpoint and configures polling', async () => {
    let capturedConfig: AgentDetailsQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: AgentDetailsQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, data: null };
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAgentInfo),
    });

    const { useAgentDetails } = loadHook();
    useAgentDetails();

    if (!capturedConfig) throw new Error('Query config was not captured');

    expect(capturedConfig.queryKey).toEqual(['agentInfo']);
    expect(capturedConfig.retry).toBe(5);
    expect(capturedConfig.retryDelay(5)).toBe(30000);
    expect(capturedConfig.refetchInterval(null)).toBe(2000);
    expect(capturedConfig.refetchInterval(mockAgentInfo)).toBe(FORTYFIVE_SECONDS);

    await expect(capturedConfig.queryFn()).resolves.toEqual(mockAgentInfo);
    expect(global.fetch).toHaveBeenCalledWith(`${LOCAL}/agent-info`);
  });

  it('throws when the agent-info request fails', async () => {
    let capturedConfig: AgentDetailsQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: AgentDetailsQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, isError: false };
    });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    const { useAgentDetails } = loadHook();
    useAgentDetails();

    if (!capturedConfig) throw new Error('Query config was not captured');
    await expect(capturedConfig.queryFn()).rejects.toThrow('Failed to fetch agent info');
  });

  it('returns the mock agent data in mock mode', async () => {
    jest.useFakeTimers();
    process.env.IS_MOCK_ENABLED = 'true';
    jest.resetModules();

    let capturedConfig: AgentDetailsQueryConfig | undefined;
    mockUseQuery.mockImplementation((config: AgentDetailsQueryConfig) => {
      capturedConfig = config;
      return { isLoading: false, data: mockAgentInfo };
    });

    const { useAgentDetails } = loadHook();
    useAgentDetails();

    if (!capturedConfig) throw new Error('Query config was not captured');

    const pendingResult = capturedConfig.queryFn();
    jest.advanceTimersByTime(2000);

    await expect(pendingResult).resolves.toEqual(mockAgentInfo);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
