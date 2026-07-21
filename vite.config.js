import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'placeholder-product.png'],
      manifest: {
        name: 'DIVERSUS SHOP',
        short_name: 'DIVERSUS',
        description: 'Acessórios com atitude — relógios, camisas e cordões.',
        theme_color: '#8A2BE2',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Nunca coloca em cache chamadas pro Supabase (produtos, pedidos, etc
      // sempre precisam vir direto do servidor, nunca de uma cópia velha)
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('supabase.co'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
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
