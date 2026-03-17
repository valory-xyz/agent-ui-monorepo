export default {
  displayName: 'babydegen-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/babydegen-ui',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // Type declarations — no runtime logic
    '!src/**/*.d.ts',
    '!src/types.ts',
    // App entry point — bootstraps React, not unit-testable
    '!src/index.tsx',
    // Mock data — plain objects used only when IS_MOCK_ENABLED=true
    '!src/mocks/**',
    // Plain constant objects — no functions/branches to cover
    '!src/constants/colors.ts',
    '!src/constants/theme.ts',
    // Canvas-dependent plugin — requires jest-canvas-mock or E2E, deferred
    '!src/utils/chartjs/donut-center-plugin.ts',
    // Plain color palette array — no logic
    '!src/utils/chartjs/palette.ts',
  ],
  // Ignore all node_modules except ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark.*|rehype.*|micromark.*|unist.*|unified|vfile.*|mdast.*|hast.*|html-.*|estree.*|markdown.*|longest-streak|devlop|character-entities.*|decode-named-character-reference|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|ccount|zwitch|trim-lines|bail|is-plain-obj|trough|escape-string-regexp)/)',
  ],
};
