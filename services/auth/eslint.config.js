import path from 'node:path';

import { defineConfig, includeIgnoreFile } from 'eslint/config';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-config-prettier';
import baseConfig from '@hono/eslint-config';
import oxlint from 'eslint-plugin-oxlint';
import ts from 'typescript-eslint';
import globals from 'globals';
import js from '@eslint/js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	prettier,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/prefer-optional-chain': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn'
		},
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json'
			},
			globals: { ...globals.node }
		},
		files: ['**/*.ts', '**/*.js'],
		ignores: ['eslint.config.js'],
		plugins: {
			baseConfig
		}
	},
	{
		rules: {
			'perfectionist/sort-imports': [
				'warn',
				{
					customGroups: [
						{
							elementNamePattern: ['^hono', '^hono.*'],
							modifiers: ['value'],
							groupName: 'hono'
						},
						{
							elementNamePattern: '^#/.+',
							groupName: 'internal',
							modifiers: ['value']
						},
						{
							elementNamePattern: '^#/modules*',
							groupName: 'modules',
							modifiers: ['value']
						},
						{
							elementNamePattern: '^#/lib*',
							modifiers: ['value'],
							groupName: 'lib'
						}
					],
					groups: ['type', 'builtin', 'external', 'hono', 'modules', 'lib', 'internal'],
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					tsconfig: {
						rootDir: '.'
					},
					partitionByComment: false,
					partitionByNewLine: false,
					type: 'line-length',
					newlinesBetween: 1,
					order: 'desc'
				}
			],
			'perfectionist/sort-variable-declarations': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-intersection-types': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-object-types': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-union-types': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-interfaces': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-jsx-props': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-classes': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-exports': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			],
			'perfectionist/sort-objects': [
				'warn',
				{
					fallbackSort: { type: 'alphabetical', order: 'asc' },
					type: 'line-length',
					order: 'desc'
				}
			]
		},
		files: ['**/*.ts', '**/*.js', 'eslint.config.js'],
		plugins: {
			perfectionist
		}
	},
	...oxlint.configs['flat/recommended']
);
