import { defineConfig } from 'oxfmt';

import { FORMAT_IGNORE_PATTERNS } from './shared-ignore.config.js';

export default defineConfig({
  ignorePatterns: FORMAT_IGNORE_PATTERNS,
  trailingComma: 'all',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  printWidth: 100,
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  jsxSingleQuote: false,
});
