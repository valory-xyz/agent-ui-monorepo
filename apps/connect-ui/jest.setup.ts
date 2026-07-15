import '@testing-library/jest-dom';

// Force live-API code paths in tests; use .mock.spec.ts files for mock-mode paths.
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
