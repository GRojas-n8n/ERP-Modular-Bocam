import { test, expect } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Smoke test post-deploy: login → dashboard, contra producción real.
 *
 * Spec: openspec/changes/ci-playwright-smoke-post-deploy/
 * Corre en CI al final de deploy-vps.yml / deploy-vps-backend.yml, no en
 * cada PR — necesita el dominio real para tener sentido (ver design.md).
 *
 * Usa un usuario real existente (no una cuenta dedicada de CI, decisión
 * explícita del usuario) vía SMOKE_TEST_EMAIL/SMOKE_TEST_PASSWORD. El
 * spec nunca debe imprimir esos valores.
 * ---------------------------------------------------------------------------
 */

const EMAIL = process.env.SMOKE_TEST_EMAIL;
const PASSWORD = process.env.SMOKE_TEST_PASSWORD;

test.beforeAll(() => {
  const missing = [
    !EMAIL && 'SMOKE_TEST_EMAIL',
    !PASSWORD && 'SMOKE_TEST_PASSWORD',
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(
      `Smoke test post-deploy: faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
      'Configúralas como secrets del repositorio (ver openspec/changes/ci-playwright-smoke-post-deploy/tasks.md, grupo 4).'
    );
  }
});

test('login y dashboard cargan sin errores tras el deploy', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto('/');
  await page.locator('#login-email-input').fill(EMAIL!);
  await page.locator('#login-password-input').fill(PASSWORD!);
  await page.locator('#login-submit-btn').click();

  // #logout-btn es el marcador post-login independiente de rol: no todos
  // los usuarios ven el mismo botón de "home" (ver Layout.tsx), pero
  // todos los usuarios autenticados ven el logout en el nav.
  await expect(page.locator('#logout-btn')).toBeVisible({ timeout: 20_000 });

  expect(pageErrors, `Errores de página no capturados: ${pageErrors.join(' | ')}`).toHaveLength(0);
  expect(consoleErrors, `Errores de consola durante login+dashboard: ${consoleErrors.join(' | ')}`).toHaveLength(0);
});
