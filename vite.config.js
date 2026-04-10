import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spa-fallback-404',
      closeBundle() {
        copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'));
      },
    },
  ],
  base: '/',
  test: {
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
