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
   ]),
   {
      files: ['**/*.{ts,tsx}'],
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
         '@typescript-eslint/array-type': 'warn',
         '@typescript-eslint/require-await': 'warn',
         '@typescript-eslint/no-unsafe-assignment': 'warn',
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
                     /* Core React & TanStack Framework */
                     elementNamePattern: [
                        '^react$',
                        '^react-.+$',
                        '^@tanstack/.*$',
                     ],
                     modifiers: ['value'],
                     groupName: 'framework',
                  },
                  {
                     /* Routes components or logic */
                     elementNamePattern: '^@/routes/.*$',
                     modifiers: ['value'],
                     groupName: 'routes',
                  },
                  {
                     /* Business Logic Modules */
                     elementNamePattern: '^@/features/.*$',
                     modifiers: ['value'],
                     groupName: 'modules',
                  },
                  {
                     /* Custom React Hooks */
                     elementNamePattern: '^@/shared/hooks/.*$',
                     modifiers: ['value'],
                     groupName: 'hooks',
                  },
                  {
                     /* Internal Libraries & Utils */
                     elementNamePattern: '^@/shared/lib/.*$',
                     modifiers: ['value'],
                     groupName: 'libs',
                  },
                  {
                     /* App Components (Custom) */
                     elementNamePattern: '^@/shared/components/(?!ui/).*$',
                     modifiers: ['value'],
                     groupName: 'components',
                  },
                  {
                     /* UI Components (Shadcn/UI) */
                     elementNamePattern: '^@/shared/components/ui/.*$',
                     modifiers: ['value'],
                     groupName: 'shadcn',
                  },
                  {
                     /* Assets & Icons */
                     elementNamePattern: ['^@radix-ui/.*$', '^@base-ui/.*$'],
                     modifiers: ['value'],
                     groupName: 'lib-ui',
                  },
                  {
                     /* Assets & Icons */
                     elementNamePattern: [
                        '^@/assets.*$',
                        '^lucide-react$',
                        '^@iconify/react',
                        '^.+\\.css$',
                     ],
                     modifiers: ['value'],
                     groupName: 'assets',
                  },
               ],
               groups: [
                  'type',
                  'builtin',
                  'framework',
                  'external',
                  'routes',
                  'modules',
                  'hooks',
                  'libs',
                  'components',
                  'shadcn',
                  'lib-ui',
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
            {
               type: 'line-length',
               order: 'desc',
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
         'perfectionist/sort-exports': [
            'warn',
            {
               type: 'line-length',
               order: 'desc',
            },
         ],
         'perfectionist/sort-objects': [
            'warn',
            {
               type: 'line-length',
               order: 'desc',
            },
         ],
         'perfectionist/sort-classes': [
            'warn',
            {
               type: 'line-length',
               order: 'desc',
            },
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
