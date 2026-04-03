import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  envDir: '../',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      manifest: {
        name: 'Notely - Smart Note Taking',
        short_name: 'Notely',
        description: 'Smart offline-first note taking app with voice and media support.',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      injectManifest: {
        rollupFormat: 'iife',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Exclude KaTeX fonts from precache (59 files, ~1MB)
        // They load on-demand only when math rendering is used
        globIgnores: ['**/*.woff', '**/*.woff2', '**/*.ttf'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],

  // ── Build Optimization ──
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk warning threshold (we're splitting manually)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — cached separately, rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy libs — only loaded when PageView route is hit
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-markdown': ['react-markdown', 'remark-math', 'rehype-katex', 'katex'],
          'vendor-motion': ['framer-motion'],
        }
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify with esbuild (faster than terser, good enough compression)
    minify: 'esbuild',
  },

  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
  },
});
