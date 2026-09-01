/**
 * Shared ignore patterns for ESLint + Oxlint.
 *
 * Keep these patterns tool-agnostic.
 * ESLint uses minimatch-style globs.
 * Oxlint uses gitignore-style matching.
 */

export const FORMAT_IGNORE_PATTERNS = [
  // ============================================================
  // Generated / minified
  // ============================================================

  '**/*.min.js',
  'src/routeTree.gen.ts',
  '**/.nx/**',
  '**/build/**',
  '**/snap/**',

  // ============================================================
  // Assets / deprecated code
  // ============================================================

  'public/*',
  'src/assets/*',
  '!src/assets/styles.css',
  '**/deprecated/**',

  // ============================================================
  // Lock files
  // ============================================================

  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lock',

  'LICENSE',

  // ============================================================
  // Build / generated output
  // ============================================================

  '.turbo/**',
  'coverage/**',
  'playwright-report/**',
  'test-results/**',

  // ============================================================
  // Static / generated application files
  // ============================================================

  'public/**',

  // ============================================================
  // Agent / AI working files
  // ============================================================

  '.agents/**/scripts',
  '.claude/**/scripts',
  'init.sh',

  // ============================================================
  // Shadcn and other libs
  // ============================================================

  'src/components/ui/**',
  'src/components/ai-elements/**',

  // ============================================================
  // Editor / tooling
  // ============================================================

  '.gitignore',
  '.prettierignore',
];

export const LINT_IGNORE_PATTERNS = [
  ...FORMAT_IGNORE_PATTERNS,
  '.vscode/**',

  // ============================================================
  // Tooling configuration
  // ============================================================

  'eslint.config.js',
  '.oxlintrc.*',
  'oxlint.config.*',
  '.oxfmtrc.*',
  'oxfmt.config.*',
  'next.config.ts',
  'shared-ignore.config.js',
];
