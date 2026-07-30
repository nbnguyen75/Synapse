import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import oxlint from 'eslint-plugin-oxlint';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores([
    'dist',
    'eslint.config.js',
    'prettier.config.js',
    'public/*',
    'src/routeTree.gen.ts',
    'README.md',
    'src/routeTree.gen.ts',
    'project.inlang/**',
    '!project.inlang/settings.json',
    'src/paraglide/**',
    '.agents/**/scripts',
    '.claude/**/scripts',
    'AGENTS.md',
    'feature_list.json',
    'init.sh',
    'progress.md',
    'session-handoff.md',
    '**/deprecated/**',
  ]),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'import/no-cycle': 'off',
      'sort-imports': 'off',
      'import/order': 'off',
      'simple-import-sort/imports': 'off',
      'no-empty': [
        'warn',
        {
          allowEmptyCatch: true,
        },
      ],
      'no-useless-assignment': 'warn',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allowThrowingAny: false,
          allowThrowingUnknown: false,
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'Redirect',
            },
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: 'NotFoundError',
            },
          ],
        },
      ],
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'warn',
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          destructuredArrayIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',
      'react-refresh/only-export-components': 'off',
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      'perfectionist/sort-imports': [
        'warn',
        {
          customGroups: [
            {
              /* 1. Core React */
              elementNamePattern: ['^react$', '^react-dom.*$', '^react-.+$'],
              modifiers: ['value'],
              groupName: 'react',
            },
            {
              /* 2. TanStack Ecosystem */
              elementNamePattern: '^@tanstack.*$',
              modifiers: ['value'],
              groupName: 'tanstack',
            },
            {
              /* 3. Low-level UI Primitives */
              elementNamePattern: ['^@radix-ui/.*$', '^@base-ui/.*$'],
              modifiers: ['value'],
              groupName: 'lib-ui',
            },
            {
              /* 4. AI SDKs & Third-party AI Libraries */
              elementNamePattern: ['^ai$', '^@ai-sdk/.*$'],
              modifiers: ['value'],
              groupName: 'ai-libs',
            },
            {
              /* 5. Routes & Generated Route Tree */
              elementNamePattern: ['^@/routes/.*$', '.*routeTree\\.gen.*'],
              modifiers: ['value'],
              groupName: 'routes',
            },
            {
              /* 6. Page Layouts (DashboardLayout, RootLayout,...) */
              elementNamePattern: '^@/layouts/.*$',
              modifiers: ['value'],
              groupName: 'layouts',
            },
            {
              /* 7. Feature Modules (Business Logic) */
              elementNamePattern: '^@/features/.*$',
              modifiers: ['value'],
              groupName: 'modules',
            },
            {
              /* 8. Custom React Hooks */
              elementNamePattern: '^@/hooks/.*$',
              modifiers: ['value'],
              groupName: 'hooks',
            },
            {
              /* 9. Global State Store */
              elementNamePattern: '^@/store/.*$',
              modifiers: ['value'],
              groupName: 'store',
            },
            {
              /* 10. Context Providers */
              elementNamePattern: '^@/providers/.*$',
              modifiers: ['value'],
              groupName: 'providers',
            },
            {
              /* 11. Configurations & Environment */
              elementNamePattern: '^@/config/.*$',
              modifiers: ['value'],
              groupName: 'config',
            },
            {
              /* 12. Internal Utils & i18n (Paraglide) */
              elementNamePattern: [
                '^@/lib/.*$',
                '^@/paraglide/.*$',
                '^\\./paraglide/.*$',
              ],
              modifiers: ['value'],
              groupName: 'libs',
            },
            {
              /* 13. App Components (Loại trừ ui/ và ai-elements/) */
              elementNamePattern: '^@/components/(?!(ui|ai-elements)/).*$',
              modifiers: ['value'],
              groupName: 'components',
            },
            {
              /* 14. AI Elements Components */
              elementNamePattern: '^@/components/ai-elements/.*$',
              modifiers: ['value'],
              groupName: 'ai-elements',
            },
            {
              /* 15. UI Components (Shadcn/UI) */
              elementNamePattern: '^@/components/ui/.*$',
              modifiers: ['value'],
              groupName: 'shadcn',
            },
            {
              /* 16. Assets & Icons */
              elementNamePattern: [
                '^@/assets.*$',
                '^lucide-react$',
                '^@iconify/react$',
              ],
              modifiers: ['value'],
              groupName: 'assets',
            },
          ],
          groups: [
            'type',
            'builtin',
            'react',
            'tanstack',
            'external',
            'lib-ui',
            'ai-libs',
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
            'parent',
            'sibling',
            'index',
            'assets',
            'side-effect-style',
            'style',
            'import',
          ],
          tsconfig: { rootDir: '.' },
          partitionByComment: false,
          partitionByNewLine: false,
          type: 'line-length',
          newlinesBetween: 1,
          order: 'desc',
        },
      ],
      'perfectionist/sort-variable-declarations': [
        'warn',
        { type: 'line-length', order: 'desc' },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        { type: 'line-length', order: 'desc' },
      ],
      'perfectionist/sort-interfaces': [
        'warn',
        { type: 'line-length', order: 'desc' },
      ],
      'perfectionist/sort-exports': [
        'warn',
        { type: 'line-length', order: 'desc' },
      ],
      'perfectionist/sort-objects': [
        'warn',
        { type: 'line-length', order: 'desc' },
      ],
      'perfectionist/sort-classes': [
        'warn',
        { type: 'line-length', order: 'desc' },
      ],
    },
    files: ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js'],
    plugins: {
      perfectionist,
    },
  },
  eslintConfigPrettier,
  ...oxlint.configs['flat/recommended'],
]);
