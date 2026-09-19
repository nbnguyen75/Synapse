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
  ignore: ['**/node_modules/**', 'docs/**', 'public/**', '.agents/**', '.claude/**'],
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
    files: ['**/*.{js,ts}'],

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
              groupName: 'hono',
              modifiers: ['value'],
              elementNamePattern: '^hono(?:/.*)?$',
            },
            {
              groupName: 'config',
              modifiers: ['value'],
              elementNamePattern: '^@/config(?:/.*)?$',
            },
            {
              groupName: 'constants',
              modifiers: ['value'],
              elementNamePattern: '^@/constants(?:/.*)?$',
            },
            {
              groupName: 'db',
              modifiers: ['value'],
              elementNamePattern: '^@/db(?:/.*)?$',
            },
            {
              groupName: 'middlewares',
              modifiers: ['value'],
              elementNamePattern: '^@/middleware(?:/.*)?$',
            },
            {
              groupName: 'features',
              modifiers: ['value'],
              elementNamePattern: '^@/features(?:/.*)?$',
            },
          ],

          groups: [
            'type-import',
            'value-builtin',
            'value-external',
            'hono',
            'config',
            'constants',
            'db',
            'middlewares',
            'features',
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
