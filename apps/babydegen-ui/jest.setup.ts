// Required for babydegen-ui tests: agentMap.ts reads env at module load time.
// All static imports of agentMap will use 'modius' as agentType.
process.env.REACT_APP_AGENT_NAME = 'modius';
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
