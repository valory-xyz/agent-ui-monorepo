export default {
  displayName: 'agentsfun-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/agentsfun-ui',
  // Ignore all node_modules except ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|remark.*|rehype.*|micromark.*|unist.*|unified|vfile.*|mdast.*|hast.*|html-.*|estree.*|markdown.*|longest-streak|devlop|character-entities.*|decode-named-character-reference|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|ccount|zwitch|trim-lines|bail|is-plain-obj|trough|escape-string-regexp)/)',
  ],
};
