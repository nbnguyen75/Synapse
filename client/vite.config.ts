import path from 'path';

import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

import { paraglideVitePlugin } from '@inlang/paraglide-js';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules\/(react|react-dom|scheduler)/,
              name: 'vendor-react',
              priority: 50,
            },
            {
              test: /node_modules\/@tanstack\/(react-router|react-query|react-virtual)/,
              name: 'vendor-tanstack',
              priority: 40,
            },
            {
              test: /node_modules\/(ai|@ai-sdk)/,
              name: 'vendor-ai-core',
              priority: 30,
            },
            {
              test: /node_modules\/(lexical|@lexical)/,
              name: 'vendor-lexical',
              priority: 30,
            },
            {
              test: /node_modules\/(@rive-app|@xyflow|recharts|motion)/,
              name: 'vendor-graphics',
              priority: 25,
            },
            {
              test: /node_modules\/(@base-ui|@iconify|lucide-react|cmdk|embla-carousel-react)/,
              name: 'vendor-ui-icons',
              priority: 20,
            },
            {
              test: /node_modules\/(better-auth|zod|date-fns|lodash)/,
              name: 'vendor-auth-utils',
              priority: 15,
            },
            {
              test: /node_modules\/shiki\/(dist\/)?langs\//,
              name: 'shiki-lang',
              priority: 10,
            },
            {
              test: /node_modules\/shiki\/(dist\/)?themes\//,
              name: 'shiki-theme',
              priority: 10,
            },
            {
              test: /node_modules\/mermaid\/dist\/diagrams\//,
              name: 'mermaid-diagram',
              priority: 10,
            },
          ],
          minShareCount: 2,
          minSize: 25000,
        },
      },
      treeshake: {
        moduleSideEffects: (id) => (id.endsWith('.css') ? true : undefined),
        propertyReadSideEffects: false,
        annotations: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    imagetools(),
    devtools(),
    paraglideVitePlugin({
      strategy: ['cookie', 'baseLocale'],
      cookieName: 'synapse-locale',
      project: './project.inlang',
      outdir: './src/paraglide',
      emitTsDeclarations: true,
    }),
    tanstackRouter({
      autoCodeSplitting: true,
      target: 'react',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      manifest: {
        icons: [
          {
            src: 'manifest-icon-192.maskable.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: 'manifest-icon-512.maskable.png',
            type: 'image/png',
            sizes: '512x512',
          },
          {
            src: 'manifest-icon-512.maskable.png',
            purpose: 'any maskable',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        description: 'Personal Knowledge Assistant',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        display: 'standalone',
        short_name: 'Synapse',
        name: 'Synapse',
        start_url: '/',
      },
      workbox: {
        globIgnores: [
          '**/assets/shiki-lang-*.js',
          '**/assets/shiki-theme-*.js',
          '**/assets/mermaid-diagram-*.js',
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // * 6MB
        navigateFallbackDenylist: [/^\/api/],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      devOptions: {
        enabled: false,
      },
      registerType: 'autoUpdate',
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    tsconfigPaths: true,
  },
});
