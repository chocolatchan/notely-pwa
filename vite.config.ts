import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      manifest: {
        name: 'Notely - Offline Notes',
        short_name: 'Notely',
        description: 'Ghi chú offline thông minh với giọng nói',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      injectManifest: {
        rollupFormat: 'iife',
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
