import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@bocam/ui-core': fileURLToPath(new URL('../../packages/ui-core/src/index.tsx', import.meta.url)),
      '@bocam/ui-core/dashboard': fileURLToPath(new URL('../../packages/ui-core/src/dashboard/index.tsx', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/v1/auth': 'http://localhost:3003',
      '/api/v1/finanzas': 'http://localhost:3004',
      '/api/v1/compras': 'http://localhost:3002',
      '/api/v1/gerencia-tecnica': 'http://localhost:3001',
      '/api/v1/control-obra': 'http://localhost:3005',
      '/api/v1/personal': 'http://localhost:3006',
      '/api/v1/seguridad': 'http://localhost:3007',
    }
  }
})
