// Required for predict-ui tests: agentMap.ts reads env at module load time.
// All static imports of agentMap will use 'omenstrat_trader' as agentType.
process.env.REACT_APP_AGENT_NAME = 'omenstrat_trader';
process.env.IS_MOCK_ENABLED = 'false';

// Ant Design uses window.matchMedia (via useBreakpoint) which is not available in jsdom.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
