import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Config separada de vite.config.ts: Vitest depende de una copia de `vite`
// distinta a la que usa app-shell para dev/build (versiones distintas
// hoisteadas por npm workspaces), así que los tipos de `vitest/config` no
// se fusionan de forma confiable con los de `vite.config.ts` vía
// `/// <reference types="vitest/config" />`. Un archivo separado evita el
// choque de tipos sin afectar la config de producción.
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@bocam/ui-core': fileURLToPath(new URL('../../packages/ui-core/src/index.tsx', import.meta.url)),
      '@bocam/ui-core/dashboard': fileURLToPath(new URL('../../packages/ui-core/src/dashboard/index.tsx', import.meta.url)),
      '@bocam/roles': fileURLToPath(new URL('../../packages/roles/src/index.ts', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Restringido a src/: test/unit/ contiene un script preexistente
    // (setCurrentProjectId.logic.test.ts) pensado para ejecutarse
    // directamente con `node -r ts-node/register/transpile-only`, sin
    // describe/it — Vitest lo reporta como "No test suite found" si lo
    // recoge por su patrón *.test.ts por defecto.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
