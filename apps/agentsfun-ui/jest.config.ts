export default {
  displayName: 'agentsfun-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/agentsfun-ui',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/types.ts',
    '!src/main.tsx',
    '!src/assets/**',
  ],
  // Ignore all node_modules except ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark.*|rehype.*|micromark.*|unist.*|unified|vfile.*|mdast.*|hast.*|html-.*|estree.*|markdown.*|longest-streak|devlop|character-entities.*|decode-named-character-reference|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|ccount|zwitch|trim-lines|bail|is-plain-obj|trough|escape-string-regexp)/)',
  ],
};
