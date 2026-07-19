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
   ]),
   {
      files: ['**/*.{ts,tsx}'],
      rules: {
         'import/no-cycle': 'off',
         'sort-imports': 'off',
         'import/order': 'off',
         'simple-import-sort/imports': 'off',
         '@typescript-eslint/array-type': 'warn',
         '@typescript-eslint/require-await': 'warn',
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
                     /* Core React & Next.js Framework */
                     elementNamePattern: [
                        '^react$',
                        '^react-.+$',
                        '^next$',
                        '^next/.+$',
                     ],
                     modifiers: ['value'],
                     groupName: 'framework',
                  },
                  {
                     elementNamePattern: '^#translation/.*$',
                     modifiers: ['value'],
                     groupName: 'translation',
                  },
                  {
                     /* App Router segments (app/**) */
                     elementNamePattern: '^@/app/.*$',
                     modifiers: ['value'],
                     groupName: 'routes',
                  },
                  {
                     /* Business Logic Modules */
                     elementNamePattern: '^@/modules/.*$',
                     modifiers: ['value'],
                     groupName: 'modules',
                  },
                  {
                     /* Custom React Hooks */
                     elementNamePattern: '^@/hooks/.*$',
                     modifiers: ['value'],
                     groupName: 'hooks',
                  },
                  {
                     /* Internal Libraries & Utils */
                     elementNamePattern: '^@/lib/.*$',
                     modifiers: ['value'],
                     groupName: 'libs',
                  },
                  {
                     /* App Components (Custom) */
                     elementNamePattern: '^@/components/(?!ui/).*$',
                     modifiers: ['value'],
                     groupName: 'components',
                  },
                  {
                     /* UI Components (Shadcn/UI) */
                     elementNamePattern: '^@/components/ui/.*$',
                     modifiers: ['value'],
                     groupName: 'shadcn',
                  },
                  {
                     /* Radix / Base UI primitives */
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
                        '^@iconify-react.*$',
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
                  'translation',
                  'routes',
                  'modules',
                  'hooks',
                  'libs',
                  'components', // Component tự viết lên trước
                  'shadcn', // Component UI (shadcn) theo sau
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
