import { defineConfig } from 'oxfmt';

import { FORMAT_IGNORE_PATTERNS } from './shared-ignore.config.js';

export default defineConfig({
  ignorePatterns: FORMAT_IGNORE_PATTERNS,
  arrowParens: 'always',
  jsxSingleQuote: false,
  bracketSpacing: true,
  trailingComma: 'all',
  singleQuote: true,
  endOfLine: 'lf',
  printWidth: 100,
  useTabs: false,
  tabWidth: 2,
  semi: true,
});
