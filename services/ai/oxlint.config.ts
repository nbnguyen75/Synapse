import { defineConfig } from 'oxlint';

import { LINT_IGNORE_PATTERNS } from './shared-ignore.config.js';

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'import', 'oxc', 'promise'],
  ignorePatterns: LINT_IGNORE_PATTERNS,
  options: {
    typeAware: true,
  },
  env: {
    builtin: true,
    node: true,
  },

  categories: {
    correctness: 'error',
    suspicious: 'warn',
    pedantic: 'off',
    style: 'off',
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'eslint/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        vars: 'all',
        ignoreRestSiblings: false,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      },
    ],
    'eslint/no-shadow': 'off',

    'import/no-unassigned-import': 'off',
    'import/no-cycle': 'off',

    'typescript/only-throw-error': [
      'error',
      {
        allowThrowingAny: false,
        allowThrowingUnknown: false,
      },
    ],

    'typescript/no-floating-promises': 'error',
    'typescript/no-misused-promises': 'error',

    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/no-unsafe-type-assertion': 'error',
    'typescript/no-unsafe-assignment': 'warn',
    'typescript/no-unsafe-call': 'warn',
    'typescript/restrict-template-expressions': 'off',

    'unicorn/no-array-reverse': 'warn',
    'unicorn/no-array-sort': 'warn',
    'unicorn/consistent-function-scoping': 'warn',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/throw-new-error': 'warn',
    'unicorn/prefer-number-properties': 'warn',

    'typescript/array-type': [
      'error',
      {
        default: 'generic',
        readonly: 'generic',
      },
    ],

    'typescript/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': false,
      },
    ],

    'typescript/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],

    'typescript/method-signature-style': ['error', 'property'],

    'typescript/no-duplicate-enum-values': 'error',
    'typescript/no-extra-non-null-assertion': 'error',
    'typescript/no-for-in-array': 'error',

    'typescript/no-inferrable-types': [
      'error',
      {
        ignoreParameters: true,
      },
    ],

    'typescript/no-explicit-any': 'error',
    'typescript/no-misused-new': 'error',
    'typescript/no-namespace': 'error',
    'typescript/no-non-null-asserted-optional-chain': 'error',

    'typescript/no-unnecessary-condition': 'error',
    'typescript/no-unnecessary-type-assertion': 'error',

    'typescript/no-unsafe-function-type': 'error',
    'typescript/no-wrapper-object-types': 'error',

    'typescript/prefer-as-const': 'error',
    'typescript/prefer-for-of': 'warn',

    'typescript/require-await': 'warn',
    'typescript/triple-slash-reference': 'error',

    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-commonjs': 'error',
    'import/no-duplicates': 'error',
  },
});
