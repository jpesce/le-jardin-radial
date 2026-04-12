import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spa-fallback-404',
      closeBundle() {
        const src = resolve('dist/index.html');
        copyFileSync(src, resolve('dist/404.html'));
        for (const lang of ['en', 'fr']) {
          mkdirSync(resolve(`dist/${lang}`), { recursive: true });
          copyFileSync(src, resolve(`dist/${lang}/index.html`));
        }
      },
    },
  ],
  base: '/',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
