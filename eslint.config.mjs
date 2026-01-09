import nx from '@nx/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  ...nx.configs['flat/base'],
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Keep this minimal to avoid typescript-estree recommended helper
    },
  },
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/.next',
      '**/.github',
      '**/node_modules',
      '**/*.log',
      '**/.idea',
      '**/.vscode',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    plugins: {
      prettier: prettier,
      'simple-import-sort': simpleImportSort,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          semi: true,
          trailingComma: 'all',
          singleQuote: true,
          printWidth: 100,
          tabWidth: 2,
          importOrderSeparation: true,
          importOrderSortSpecifiers: true,
          importOrder: [
            '<THIRD_PARTY_MODULES>',
            '^@agent-ui-monorepo/(.*)$',
            '^libs/*',
            '^(store|util|common-util|components|data|hooks|context|types)/(.*)$',
            '^[./]',
          ],
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
];
