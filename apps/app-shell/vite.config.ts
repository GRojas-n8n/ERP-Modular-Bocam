import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // CRÍTICO: Fuerza que react y react/jsx-runtime SIEMPRE se resuelvan
      // desde app-shell/node_modules (React 19), sin importar desde qué
      // directorio se importan. Sin esto, packages/ui-core/src/*.tsx sube
      // por el árbol hasta el node_modules raíz del monorepo que tiene
      // React 18.3.1 → elementos con $$typeof react.element (símbolo viejo)
      // → React 19 reconciler los rechaza con error #525.
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      // Aliases de módulos locales
      '@bocam/ui-core': fileURLToPath(new URL('../../packages/ui-core/src/index.tsx', import.meta.url)),
      '@bocam/ui-core/dashboard': fileURLToPath(new URL('../../packages/ui-core/src/dashboard/index.tsx', import.meta.url)),
    },
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
    }
  },
  preview: {
    port: 3000,
  }
})
