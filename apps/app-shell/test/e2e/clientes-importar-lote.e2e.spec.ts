import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: importación masiva de Clientes desde CSV/Excel
 * Spec:  openspec/changes/carga-masiva-clientes-ventas/
 * Tarea: 4.1 del tasks.md (verificación manual en navegador)
 *
 * Requiere levantados: apps/auth (3003), apps/ventas (3012), apps/app-shell (3000)
 * Usuario de prueba (seed de apps/auth): admin@alfa.bocam.com / Admin.2026
 * ---------------------------------------------------------------------------
 */

const ADMIN_EMAIL = 'admin@alfa.bocam.com';
const ADMIN_PASSWORD = 'Admin.2026';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('#login-email-input').fill(ADMIN_EMAIL);
  await page.locator('#login-password-input').fill(ADMIN_PASSWORD);
  await page.locator('#login-submit-btn').click();
  // El dashboard confirma sesión iniciada (sidebar con "Ventas" visible para admin).
  await expect(page.getByRole('button', { name: 'Ventas', exact: true })).toBeVisible({ timeout: 15_000 });
}

test('admin importa un lote de Clientes con filas válidas, inválidas y RFC duplicado', async ({ page }) => {
  // Surface uncaught JS errors (ej. crash de un Error Boundary) con mensaje
  // claro en vez de un timeout genérico en el siguiente `expect`.
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await login(page);

  await page.getByRole('button', { name: 'Ventas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Importar CSV/Excel' })).toBeVisible();

  // ── Preparar CSV: 2 válidos, 1 sin razon_social, 2 con RFC duplicado ──────
  const sufijo = Date.now().toString().slice(-8);
  const csvContent = [
    'rfc_tax_id,razon_social,email_contacto,telefono',
    `PWA${sufijo}1,Cliente Playwright Uno,contacto1@example.com,5551234567`,
    `PWA${sufijo}2,Cliente Playwright Dos,,`,
    `PWA${sufijo}3,,sin.razon@example.com,`,
    `PWA${sufijo}DUP,Cliente Duplicado A,,`,
    `PWA${sufijo}DUP,Cliente Duplicado B,,`,
  ].join('\n');
  const csvPath = path.join(os.tmpdir(), `clientes-e2e-${sufijo}.csv`);
  fs.writeFileSync(csvPath, csvContent, 'utf-8');

  // ── Subir el archivo ───────────────────────────────────────────────────
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(csvPath);

  // ── Vista previa: 2 listos, 3 con error (1 sin razon_social + 2 RFC dup) ──
  await expect(page.getByText('Vista previa — Importación de Clientes')).toBeVisible();
  await expect(page.getByText('Listos para importar')).toBeVisible();

  const listosCount = page.locator('text=Listos para importar').locator('..').locator('p').first();
  await expect(listosCount).toHaveText('2');
  const conErrorCount = page.locator('text=Con error').locator('..').locator('p').first();
  await expect(conErrorCount).toHaveText('3');

  // ── Confirmar importación ──────────────────────────────────────────────
  await page.getByRole('button', { name: /Importar \d+ registros?/ }).click();

  // ── Resultado: 2 creados, 3 errores ────────────────────────────────────
  await expect(page.getByText('Resultado de la importación')).toBeVisible({ timeout: 10_000 });
  const creadosCount = page.locator('text=Clientes creados').locator('..').locator('p').first();
  await expect(creadosCount).toHaveText('2');
  const erroresCount = page.locator('text=Filas con error').locator('..').locator('p').first();
  await expect(erroresCount).toHaveText('3');
  await expect(page.getByText(/RFC duplicado/)).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar' }).click();

  // ── Confirmar que el catálogo se refrescó con los 2 clientes creados ───
  await expect(page.getByText('Cliente Playwright Uno')).toBeVisible();
  await expect(page.getByText('Cliente Playwright Dos')).toBeVisible();

  fs.unlinkSync(csvPath);
});
