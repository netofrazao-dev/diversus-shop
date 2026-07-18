import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminho relativo: funciona em qualquer subpasta (GitHub Pages, subdomínio, etc.)
  // sem precisar saber o nome do repositório de antemão.
  base: './',
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
