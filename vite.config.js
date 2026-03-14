import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Mirrors the Vercel rewrite: /img/* → Supabase storage
        '/img': {
          target: `${env.VITE_SUPABASE_URL}/storage/v1/object/public`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/img/, ''),
        },
      },
    },
  }
})
