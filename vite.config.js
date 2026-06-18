import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Luga Gy',
          short_name: 'Luga Gy',
          description: 'Panel de administración de Luga Gy',
          start_url: '/admin',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#FF9EB5',
          icons: [
            { src: 'pwa-64x64.png',    sizes: '64x64',   type: 'image/png' },
            { src: 'pwa-192x192.png',  sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png',  sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/img': {
          target: `${env.VITE_SUPABASE_URL}/storage/v1/object/public`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/img/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
          },
        },
      },
    },
  }
})
