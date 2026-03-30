export default {
  displayName: 'predict-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/predict-ui',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // Type declarations — no runtime logic
    '!src/**/*.d.ts',
    '!src/types.ts',
    // App entry point — bootstraps React, not unit-testable
    '!src/main.tsx',
    // SVG/image assets
    '!src/assets/**',
    // Mock data — plain objects used only when IS_MOCK_ENABLED=true
    '!src/mocks/**',
    // Plain constant objects — no functions/branches to cover
    '!src/constants/reactQueryKeys.ts',
    '!src/constants/sizes.ts',
    '!src/constants/theme.ts',
    // Plain URL string constants (not utils/urls.ts which has logic)
    '!src/constants/urls.ts',
  ],
  // Ignore all node_modules except ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark.*|rehype.*|micromark.*|unist.*|unified|vfile.*|mdast.*|hast.*|html-.*|estree.*|markdown.*|longest-streak|devlop|character-entities.*|decode-named-character-reference|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|ccount|zwitch|trim-lines|bail|is-plain-obj|trough|escape-string-regexp)/)',
  ],
};
