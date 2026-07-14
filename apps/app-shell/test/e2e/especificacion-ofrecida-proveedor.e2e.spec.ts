import { test, expect } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: Compras captura la especificación técnica que ofrece cada
 * proveedor por renglón del Cuadro Comparativo, y el Residente la ve separada
 * por proveedor durante la evaluación técnica.
 *
 * Spec:  openspec/changes/especificacion-tecnica-ofrecida-proveedor/
 * Tarea: 7.3 del tasks.md
 *
 * Requiere levantados: apps/auth (3003), apps/compras (3002), apps/app-shell (3000)
 * Usuarios de prueba (seed de apps/auth): comprador@alfa.bocam.com / Comp.2026 (procurement)
 *                                          residente@alfa.bocam.com / Res.2026 (residencia)
 * Datos: sembrados vía apps/compras/scratch-seed-espec-ofrecida.ts (Requisicion APROBADA
 * + item texto libre + CuadroComparativo BORRADOR + 2 Proveedores), pasados por env vars.
 * ---------------------------------------------------------------------------
 */

const PROCUREMENT_EMAIL = 'comprador@alfa.bocam.com';
const PROCUREMENT_PASSWORD = 'Comp.2026';
const RESIDENTE_EMAIL = 'residente@alfa.bocam.com';
const RESIDENTE_PASSWORD = 'Res.2026';

const FOLIO = process.env.E2E_ESPEC_FOLIO!;
const PROV_A_NOMBRE = process.env.E2E_ESPEC_PROV_A_NOMBRE!;
const PROV_B_NOMBRE = process.env.E2E_ESPEC_PROV_B_NOMBRE!;
const SPEC_A = 'Motor 5HP, marca Baldor, IP55';
const SPEC_B = 'Motor 5HP, marca WEG, IP54';

async function login(page: import('@playwright/test').Page, email: string, password: string, homeButton: string) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: homeButton, exact: true })).toBeVisible({ timeout: 15_000 });
}

test('Compras captura especificación ofrecida por proveedor y el Residente la ve separada durante la evaluación técnica', async ({ page }) => {
  test.skip(!FOLIO || !PROV_A_NOMBRE || !PROV_B_NOMBRE, 'Requiere seed previo — ver scratch-seed-espec-ofrecida.ts');
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  // ── 1. Compras: abrir el cuadro, agregar los 2 proveedores, capturar precio + especificación ofrecida ──
  await login(page, PROCUREMENT_EMAIL, PROCUREMENT_PASSWORD, 'Compras');
  await page.getByRole('button', { name: 'Compras', exact: true }).click();
  await page.getByRole('button', { name: 'Requisiciones', exact: true }).click();

  // Los 2 proveedores ya vienen precargados por el seed (ComparativaDetalle placeholder,
  // igual que en producción cuando se fusionan desde una Solicitud de Cotización
  // respondida) — evita el flujo manual "Agregar proveedor", que muta comp.estado a
  // EN_PROCESO local y esconde el botón "Enviar a Evaluación Técnica".
  const card = page.locator('div')
    .filter({ has: page.getByText(`Folio: ${FOLIO}`, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: /Crear Cuadro Comparativo|Continuar comparativa/ }) })
    .last();
  await card.getByRole('button', { name: /Crear Cuadro Comparativo|Continuar comparativa/ }).click();
  await expect(page.getByText(PROV_A_NOMBRE, { exact: true })).toBeVisible();
  await expect(page.getByText(PROV_B_NOMBRE, { exact: true })).toBeVisible();

  // Capturar precio (obligatorio para poder enviar) y especificación ofrecida por proveedor
  const precioInputs = page.locator('input[type="number"][min="0"][step="0.01"]');
  await expect(precioInputs).toHaveCount(2);
  await precioInputs.nth(0).fill('1000');
  await precioInputs.nth(1).fill('1200');

  const especInputs = page.locator('input[placeholder="Especificación ofrecida…"]');
  await expect(especInputs).toHaveCount(2);
  await especInputs.nth(0).fill(SPEC_A);
  await especInputs.nth(1).fill(SPEC_B);

  await page.getByRole('button', { name: 'Enviar a Evaluación Técnica →' }).click();
  await expect(page.getByText('Enviando...')).toHaveCount(0, { timeout: 10_000 });

  // ── 2. Residente: abrir el mismo cuadro en evaluación técnica y ver ambos valores separados ──
  await login(page, RESIDENTE_EMAIL, RESIDENTE_PASSWORD, 'Compras');
  await page.getByRole('button', { name: 'Compras', exact: true }).click();
  await page.getByRole('button', { name: 'Eval. Técnica', exact: true }).click();

  const pendienteCard = page.locator('div')
    .filter({ has: page.getByText(FOLIO) })
    .filter({ has: page.getByRole('button', { name: 'Evaluar →' }) })
    .last();
  await pendienteCard.getByRole('button', { name: 'Evaluar →' }).click();

  await expect(page.getByText(SPEC_A, { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(SPEC_B, { exact: true })).toBeVisible();
});
