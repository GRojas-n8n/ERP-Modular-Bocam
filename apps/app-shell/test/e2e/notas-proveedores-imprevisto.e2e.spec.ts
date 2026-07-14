import { test, expect } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: el campo común de notas de la requisición IMPREVISTA del
 * Residente se muestra como "Notas para Proveedores" (con su advertencia de
 * visibilidad), NO como "Justificación" — ese dato viaja a proveedores vía
 * Solicitud de Cotización/correo. La justificación interna sigue existiendo
 * (obligatoria) por ítem imprevisto.
 *
 * Spec:  openspec/changes/renombrar-notas-proveedores-imprevisto/
 * Tarea: 1.1 del tasks.md (escrito ANTES del fix — primero en rojo)
 *
 * Requiere levantados: apps/auth (3003), apps/compras, apps/app-shell (3000)
 * Usuario de prueba (seed de apps/auth): residente@alfa.bocam.com / Res.2026
 * ---------------------------------------------------------------------------
 */

const RESIDENTE_EMAIL = 'residente@alfa.bocam.com';
const RESIDENTE_PASSWORD = 'Res.2026';

test('requisición IMPREVISTO: el campo común de notas es "Notas para Proveedores" con advertencia, no "Justificación"', async ({ page }) => {
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  // ── Login como Residente ─────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login-email-input').fill(RESIDENTE_EMAIL);
  await page.locator('#login-password-input').fill(RESIDENTE_PASSWORD);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: 'Residencia', exact: true })).toBeVisible({ timeout: 15_000 });

  // ── Residencia → Requisiciones → Nueva Requisición ──────────────────────
  await page.getByRole('button', { name: 'Residencia', exact: true }).click();
  await page.getByRole('button', { name: 'Requisiciones', exact: true }).click();
  await page.getByRole('button', { name: 'Nueva Requisición' }).click();

  // ── Tipo normal (INSUMO, default): etiqueta y leyenda sin cambios ───────
  await expect(page.getByText('Notas para Proveedores', { exact: true })).toBeVisible();
  await expect(page.getByText(/Se verán en la Solicitud de Cotización y pueden llegar a los proveedores/)).toBeVisible();

  // ── Seleccionar tipo IMPREVISTO ──────────────────────────────────────────
  await page.getByRole('button', { name: /Imprevisto/ }).click();
  // El formulario imprevisto está activo: existe la justificación POR ÍTEM (interna, obligatoria)
  await expect(page.getByText('Justificación *').first()).toBeVisible();

  // ── El campo común de notas se identifica como de cara a proveedores ─────
  await expect(page.getByText('Notas para Proveedores', { exact: true })).toBeVisible();
  await expect(page.getByText(/Se verán en la Solicitud de Cotización y pueden llegar a los proveedores/)).toBeVisible();

  // ── Y ya NO existe un campo común titulado exactamente "Justificación" ───
  // (el por-ítem se titula "Justificación *", no matchea exact)
  await expect(page.getByText('Justificación', { exact: true })).toHaveCount(0);
});
