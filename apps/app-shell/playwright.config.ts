import { defineConfig, devices } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Config de Playwright — verificación manual E2E contra servicios locales.
 *
 * Requiere levantados manualmente (no se auto-arrancan desde aquí):
 *   - apps/auth   (puerto 3003)
 *   - apps/ventas, apps/compras, apps/personal, etc. según el flujo a probar
 *   - apps/app-shell (este dev server, puerto 3000 — `npm run dev`)
 * ---------------------------------------------------------------------------
 */
export default defineConfig({
  testDir: './test/e2e',
  testMatch: '**/*.e2e.spec.ts',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
