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
  '**/build/**',
  '**/dist/**',

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

  'coverage/**',
  'test-results/**',

  // ============================================================
  // Static / generated application files
  // ============================================================

  'public/**',
  'drizzle/**',

  // ============================================================
  // Agent / AI working files
  // ============================================================

  '.agents/**',
  '.claude/**',
  'init.sh',

  // ============================================================
  // Editor / tooling
  // ============================================================

  '.gitignore',
  '.dockerignore',
  '**/.env*',
  '!.env.example',
];

export const LINT_IGNORE_PATTERNS = ['**/*', '!src/**', '!seed/**', 'src/**/__tests__/**'];
