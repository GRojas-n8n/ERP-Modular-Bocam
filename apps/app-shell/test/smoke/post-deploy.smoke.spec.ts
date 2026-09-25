import { test, expect } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Smoke test post-deploy: login → dashboard, contra producción real.
 *
 * Spec: openspec/changes/ci-playwright-smoke-post-deploy/
 * Corre en CI al final de deploy-vps.yml / deploy-vps-backend.yml, no en
 * cada PR — necesita el dominio real para tener sentido (ver design.md).
 *
 * Usa una cuenta técnica dedicada, sin roles ni proyectos, vía
 * SMOKE_TEST_EMAIL/SMOKE_TEST_PASSWORD. El spec nunca debe imprimir esos
 * valores ni persistir artefactos que puedan contenerlos.
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

test('sin proyecto activo, los módulos project-scoped quedan bloqueados sin consultar datos', async ({ page }) => {
  const projectScopedRequests: string[] = [];
  const projectScopedPrefixes = [
    '/api/v1/gerencia-tecnica/',
    '/api/v1/compras/',
    '/api/v1/almacen/',
    '/api/v1/control-proyectos/',
    '/api/v1/seguridad/',
    '/api/v1/ventas/',
  ];

  page.on('request', request => {
    const pathname = new URL(request.url()).pathname;
    if (projectScopedPrefixes.some(prefix => pathname.startsWith(prefix))) {
      projectScopedRequests.push(`${request.method()} ${pathname}`);
    }
  });

  // La cuenta tecnica conserva cero roles y cero proyectos en produccion.
  // Solo hacemos visibles los menus en esta pagina de Playwright para poder
  // recorrer el guard del App Shell; el token real no gana permisos.
  await page.route('**/api/v1/auth/login', async route => {
    const response = await route.fetch();
    const payload = await response.json();
    const user = payload?.data?.user ?? payload?.user;

    if (!user || !Array.isArray(user.projects) || user.projects.length !== 0) {
      throw new Error('La cuenta tecnica del smoke debe conservar cero proyectos.');
    }

    user.roles = [
      'admin',
      'gerencia_tecnica',
      'compras',
      'warehouse',
      'control_obra',
      'residencia',
      'seguridad_hse',
      'ventas',
    ];

    await route.fulfill({ response, json: payload });
  });

  await page.goto('/');
  await page.locator('#login-email-input').fill(EMAIL!);
  await page.locator('#login-password-input').fill(PASSWORD!);
  await page.locator('#login-submit-btn').click();
  await expect(page.locator('#logout-btn')).toBeVisible({ timeout: 20_000 });

  const projectRequired = page.getByText('Proyecto activo requerido', { exact: true });
  await expect(projectRequired).toBeVisible();

  const projectScopedModules = [
    'Gerencia Técnica',
    'Compras',
    'Almacén',
    'Control de Obra',
    'Residencia',
    'Seguridad HSE',
    'Ventas',
  ];

  for (const moduleName of projectScopedModules) {
    await page.getByRole('button', { name: moduleName, exact: true }).click();
    await expect(projectRequired, `${moduleName} debe exigir proyecto activo`).toBeVisible();
  }

  await expect.poll(() => projectScopedRequests, {
    message: `No deben salir consultas project-scoped: ${projectScopedRequests.join(' | ')}`,
  }).toEqual([]);
});
