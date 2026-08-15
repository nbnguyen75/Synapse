import path from 'path';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { devtools } from '@tanstack/devtools-vite';

import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      devOptions: {
        enabled: true,
      },
      registerType: 'autoUpdate',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    tsconfigPaths: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
});
