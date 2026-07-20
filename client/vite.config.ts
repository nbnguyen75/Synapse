import path from 'path';

import { tanstackRouter } from '@tanstack/router-plugin/vite';

import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
   plugins: [
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
   },
});
