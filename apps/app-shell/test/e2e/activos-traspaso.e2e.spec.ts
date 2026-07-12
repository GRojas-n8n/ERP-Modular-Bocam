import { test, expect } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: Activos fijos — alta, traspaso con aprobación, historial
 * Spec:  openspec/changes/control-almacen-activos/
 * Tarea: 6.1 del tasks.md (verificación manual en navegador)
 *
 * Requiere levantados: apps/auth (3003), apps/almacen (3012),
 * apps/personal (3006), apps/app-shell (3000)
 * Usuario de prueba (seed de apps/auth): admin@alfa.bocam.com / Admin.2026
 * (tenant Alfa tiene 3+ proyectos — necesario para probar traspaso entre proyectos)
 * ---------------------------------------------------------------------------
 */

const ADMIN_EMAIL = 'admin@alfa.bocam.com';
const ADMIN_PASSWORD = 'Admin.2026';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('#login-email-input').fill(ADMIN_EMAIL);
  await page.locator('#login-password-input').fill(ADMIN_PASSWORD);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: 'Almacén', exact: true })).toBeVisible({ timeout: 15_000 });
}

test('admin da de alta un activo, solicita traspaso de proyecto y lo confirma desde el destino', async ({ page }) => {
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await login(page);

  await page.getByRole('button', { name: 'Almacén', exact: true }).click();
  await page.getByRole('button', { name: 'Activos', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nuevo Activo' })).toBeVisible();

  // ── Registrar el proyecto de origen (código mostrado en el selector) ────
  const projectSwitcherButton = page.locator('header button', { has: page.locator('span.truncate') });
  const proyectoOrigenCodigo = await projectSwitcherButton.innerText();

  // ── Alta de un activo ───────────────────────────────────────────────────
  const sufijo = Date.now().toString().slice(-6);
  await page.getByRole('button', { name: 'Nuevo Activo' }).click();
  await page.getByPlaceholder('Ej: VEH-01').fill(`VEH-E2E-${sufijo}`);
  await page.getByPlaceholder('Ej: Camioneta Pickup 4x4').fill(`Camioneta E2E ${sufijo}`);
  await page.getByRole('button', { name: 'Registrar Activo' }).click();
  await expect(page.getByText(`VEH-E2E-${sufijo}`)).toBeVisible({ timeout: 10_000 });

  // ── Solicitar traspaso de proyecto ──────────────────────────────────────
  const fila = page.locator('tr', { hasText: `VEH-E2E-${sufijo}` });
  await fila.getByRole('button', { name: 'Traspasar' }).click();
  await expect(page.getByRole('heading', { name: 'Solicitar traspaso' })).toBeVisible();

  // Elegir el primer proyecto destino disponible en el select (distinto al origen)
  const selectProyecto = page.locator('select').filter({ has: page.locator('option', { hasText: 'Selecciona un proyecto' }) });
  const proyectoDestinoNombre = await selectProyecto.locator('option').nth(1).innerText();
  await selectProyecto.selectOption({ label: proyectoDestinoNombre });
  await page.getByRole('button', { name: 'Solicitar traspaso' }).click();

  // El activo debe quedar EN_TRASPASO
  await expect(page.getByRole('heading', { name: 'Solicitar traspaso' })).not.toBeVisible({ timeout: 10_000 });
  await expect(fila.getByText('En traspaso')).toBeVisible();

  // ── Cambiar al proyecto destino ──────────────────────────────────────────
  await projectSwitcherButton.click();
  await page.getByRole('button', { name: proyectoDestinoNombre }).click();
  await page.waitForTimeout(500); // el switch de proyecto renueva el JWT (async)

  // ── Confirmar el traspaso desde la bandeja de pendientes ────────────────
  const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: 'Almacén', exact: true }).click();
  await nav.getByRole('button', { name: 'Activos', exact: true }).click();
  await expect(page.getByText(/traspaso.*pendiente.*de confirmar/i)).toBeVisible({ timeout: 10_000 });
  const filaPendiente = page.getByTestId('fila-pendiente').filter({ hasText: sufijo });
  await filaPendiente.getByRole('button', { name: 'Confirmar' }).click();

  // ── El activo debe aparecer disponible en el catálogo del proyecto destino ──
  await expect(page.locator('tr', { hasText: `VEH-E2E-${sufijo}` }).getByText('Disponible')).toBeVisible({ timeout: 10_000 });

  // ── Verificar el historial muestra la solicitud confirmada ──────────────
  const filaDestino = page.locator('tr', { hasText: `VEH-E2E-${sufijo}` });
  await filaDestino.getByRole('button', { name: 'Historial' }).click();
  await expect(page.getByText('Historial del activo')).toBeVisible();
  await expect(page.getByText('CONFIRMADO', { exact: true })).toBeVisible();

  console.log(`ok - traspaso de "${proyectoOrigenCodigo}" a "${proyectoDestinoNombre}" confirmado y visible en historial`);
});
