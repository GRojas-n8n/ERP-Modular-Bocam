import { test, expect } from '@playwright/test';
import {
  AVISO_VENTAS_SIN_PROYECTO,
  PETICION_PERMITIDA_SIN_PROYECTO,
  peticionesProhibidasSinProyecto,
  type PeticionObservada,
} from './ventas-alcance';

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
  // Ventas es mixto (change fix-clientes-sin-proyecto-y-edicion-rfc): Clientes es catálogo por
  // tenant y se consulta sin proyecto; Cotizaciones y Facturas siguen siendo project-scoped.
  // La única petición project-scoped permitida sin proyecto es la exacta de Clientes
  // (ver ./ventas-alcance.ts); cualquier otra, incluidas las de Cotizaciones/Facturas, falla el smoke.
  const peticiones: PeticionObservada[] = [];

  page.on('request', request => {
    peticiones.push({ method: request.method(), url: request.url() });
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

  // Módulos completamente bloqueados sin proyecto. Ventas NO está aquí: es mixto (ver más abajo).
  const projectScopedModules = [
    'Gerencia Técnica',
    'Compras',
    'Almacén',
    'Control de Obra',
    'Residencia',
    'Seguridad HSE',
  ];

  for (const moduleName of projectScopedModules) {
    await page.getByRole('button', { name: moduleName, exact: true }).click();
    await expect(projectRequired, `${moduleName} debe exigir proyecto activo`).toBeVisible();
  }

  // Ventas: Clientes (catálogo por tenant) NO se bloquea globalmente...
  const clientesRespuesta = page.waitForResponse(
    response => response.request().method() === PETICION_PERMITIDA_SIN_PROYECTO.method
      && new URL(response.url()).pathname === PETICION_PERMITIDA_SIN_PROYECTO.pathname,
    { timeout: 15_000 },
  );
  await page.getByRole('button', { name: 'Ventas', exact: true }).click();
  await expect(projectRequired, 'Ventas no debe bloquearse globalmente: Clientes es catálogo por tenant').toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Clientes/ }), 'Ventas debe mostrar la pestaña Clientes').toBeVisible();
  await clientesRespuesta; // la petición a Clientes salió (el resultado no importa: la cuenta no tiene permisos reales)

  // ...pero Cotizaciones y Facturas siguen exigiendo proyecto y no consultan datos.
  for (const pestana of [/^Cotizaciones/, /^Facturas/]) {
    await page.getByRole('button', { name: pestana }).click();
    await expect(
      page.getByText(AVISO_VENTAS_SIN_PROYECTO, { exact: true }),
      `Ventas › ${pestana} debe pedir proyecto activo`,
    ).toBeVisible();
  }

  const prohibidas = peticionesProhibidasSinProyecto(peticiones);
  expect(prohibidas, `No deben salir consultas project-scoped: ${prohibidas.join(' | ')}`).toEqual([]);
});
