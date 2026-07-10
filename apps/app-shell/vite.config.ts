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
      // Aliases de módulos locales
      '@bocam/ui-core': fileURLToPath(new URL('../../packages/ui-core/src/index.tsx', import.meta.url)),
      '@bocam/ui-core/dashboard': fileURLToPath(new URL('../../packages/ui-core/src/dashboard/index.tsx', import.meta.url)),
    },
    // React y react-dom están unificados a una sola versión en todo el
    // monorepo vía "overrides" en el package.json raíz — dedupe es una
    // defensa adicional por si un futuro `npm install` reintroduce una
    // copia duplicada (el bug original #525 documentado en el historial
    // de este archivo: dos copias de React con distinto $$typeof de
    // elemento hacían que el reconciler de React 19 rechazara elementos
    // creados por la copia vieja).
    dedupe: ['react', 'react-dom'],
  },
  define: {
    // Compatibilidad con librerías CJS que referencian process.env en producción.
    // process.env.NODE_ENV se define explícitamente para que librerías como
    // axios, react-dom, etc. activen sus optimizaciones de producción.
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1/auth': 'http://localhost:3003',
      '/api/v1/finanzas': 'http://localhost:3004',
      '/api/v1/compras': 'http://localhost:3002',
      '/api/v1/gerencia-tecnica': 'http://localhost:3001',
      '/api/v1/control-obra': 'http://localhost:3005',
      '/api/v1/personal': 'http://localhost:3006',
      '/api/v1/seguridad': 'http://localhost:3007',
      '/api/v1/calidad':   'http://localhost:3009',
      '/api/v1/reportes':  'http://localhost:3010',
      '/api/v1/control-proyectos': 'http://localhost:3013',
      '/api/v1/almacen':        'http://localhost:3012',
      '/api/v1/ventas':         'http://localhost:3012',
      '/api/v1/contabilidad':   'http://localhost:3008',
      '/api/v1/asistente':      'http://localhost:3011',
    }
  },
  preview: {
    port: 3000,
  },
})
