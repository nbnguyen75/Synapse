import path from 'path';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { devtools } from '@tanstack/devtools-vite';

import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';
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
   ],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
      tsconfigPaths: true,
   },
   build: {
      chunkSizeWarningLimit: 5000,
   },
});
