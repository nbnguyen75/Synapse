// @ts-check
import path from 'node:path';

import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config';
import perfectionist from 'eslint-plugin-perfectionist';
import tsParser from '@typescript-eslint/parser';
import { glob } from 'glob';
import { LINT_IGNORE_PATTERNS } from './shared-ignore.config.js';

const rootDir = import.meta.dirname;

const rootGitignorePath = path.resolve(rootDir, '.gitignore');

const gitignoreFiles = await glob('**/.gitignore', {
  ignore: ['**/node_modules/**', 'docs/**', 'public/**'],
  absolute: true,
});

const ignoreFiles = [
  rootGitignorePath,
  ...gitignoreFiles.filter((file) => file !== rootGitignorePath),
];

export default defineConfig([
  includeIgnoreFile(ignoreFiles, {
    gitignoreResolution: true,
  }),

  globalIgnores(LINT_IGNORE_PATTERNS, 'Project Ignore Patterns'),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      perfectionist,
    },

    rules: {
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',

          fallbackSort: {
            type: 'line-length',
            order: 'desc',
          },

          sortBy: 'path',
          ignoreCase: true,
          specialCharacters: 'keep',

          internalPattern: ['^@/.+'],

          sortSideEffects: false,
          partitionByComment: false,
          partitionByNewLine: false,

          newlinesBetween: 1,
          newlinesInside: 0,

          tsconfig: {
            rootDir: '.',
          },

          customGroups: [
            {
              groupName: 'react',
              modifiers: ['value'],
              elementNamePattern: ['^react$', '^react-dom(?:/.*)?$', '^react-.+$'],
            },
            {
              groupName: 'tanstack',
              modifiers: ['value'],
              elementNamePattern: '^@tanstack(?:/.*)?$',
            },
            {
              groupName: 'lib-ui',
              modifiers: ['value'],
              elementNamePattern: ['^@base-ui(?:/.*)?$'],
            },
            {
              groupName: 'ai-libs',
              modifiers: ['value'],
              elementNamePattern: ['^ai$', '^@ai-sdk(?:/.*)?$'],
            },
            {
              groupName: 'routes',
              modifiers: ['value'],
              elementNamePattern: '^@/routes(?:/.*)?$',
            },
            {
              groupName: 'layouts',
              modifiers: ['value'],
              elementNamePattern: '^@/layouts(?:/.*)?$',
            },
            {
              groupName: 'modules',
              modifiers: ['value'],
              elementNamePattern: '^@/modules(?:/.*)?$',
            },
            {
              groupName: 'hooks',
              modifiers: ['value'],
              elementNamePattern: '^@/hooks(?:/.*)?$',
            },
            {
              groupName: 'store',
              modifiers: ['value'],
              elementNamePattern: '^@/store(?:/.*)?$',
            },
            {
              groupName: 'providers',
              modifiers: ['value'],
              elementNamePattern: '^@/providers(?:/.*)?$',
            },
            {
              groupName: 'config',
              modifiers: ['value'],
              elementNamePattern: '^@/config(?:/.*)?$',
            },
            {
              groupName: 'libs',
              modifiers: ['value'],
              elementNamePattern: [
                '^@/lib(?:/.*)?$',
                '^@/paraglide(?:/.*)?$',
                '^\\./paraglide(?:/.*)?$',
              ],
            },
            {
              groupName: 'components',
              modifiers: ['value'],
              elementNamePattern: '^@/components(?:/(?!ui(?:/|$)|ai-elements(?:/|$)).*)?$',
            },
            {
              groupName: 'ai-elements',
              modifiers: ['value'],
              elementNamePattern: '^@/components/ai-elements(?:/.*)?$',
            },
            {
              groupName: 'shadcn',
              modifiers: ['value'],
              elementNamePattern: '^@/components/ui(?:/.*)?$',
            },
            {
              groupName: 'assets',
              modifiers: ['value'],
              elementNamePattern: [
                '^@/assets(?:/.*)?$',
                '^lucide-react$',
                '^@iconify/react$',
                '^@tabler(?:/.*)?$',
              ],
            },
          ],

          groups: [
            'type-import',
            'value-builtin',
            'react',
            'tanstack',
            'lib-ui',
            'ai-libs',
            'value-external',
            'routes',
            'layouts',
            'modules',
            'hooks',
            'store',
            'providers',
            'config',
            'libs',
            'components',
            'ai-elements',
            'shadcn',
            'assets',
            'value-internal',
            ['value-parent', 'value-sibling', 'value-index'],
            'side-effect-style',
            'side-effect',
            'style',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
      'perfectionist/sort-interfaces': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
      'perfectionist/sort-union-types': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
        },
      ],
    },
  },
]);
