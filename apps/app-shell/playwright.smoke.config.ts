import { defineConfig, devices } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Config de Playwright — smoke test post-deploy contra producción real.
 *
 * Separado de playwright.config.ts (suite E2E local, baseURL localhost:3000,
 * servicios levantados a mano): esta config corre en CI tras un deploy
 * exitoso al VPS (deploy-vps.yml / deploy-vps-backend.yml), contra el
 * dominio real, con credenciales de un usuario existente vía secrets.
 * ---------------------------------------------------------------------------
 */
export default defineConfig({
  testDir: './test/smoke',
  testMatch: '**/*.smoke.spec.ts',
  timeout: 30_000,
  fullyParallel: false,
  retries: 1,
  // El reporte de consola queda enmascarado por GitHub Actions. No generar
  // reportes persistentes: aun sin trazas ni capturas, el HTML puede serializar
  // el estado del formulario y conservar credenciales reales.
  reporter: 'list',
  use: {
    baseURL: process.env.SMOKE_BASE_URL || 'https://iretum.com',
    // Este smoke escribe credenciales reales en el formulario. Las trazas,
    // capturas y videos de Playwright conservan snapshots del DOM y pueden
    // incluir esos valores aun cuando GitHub enmascare los logs.
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
