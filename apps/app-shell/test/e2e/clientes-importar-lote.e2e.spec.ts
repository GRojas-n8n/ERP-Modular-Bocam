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
const COMPRADOR_EMAIL = 'comprador@alfa.bocam.com';
const COMPRADOR_PASSWORD = 'Comp.2026';

async function login(page: import('@playwright/test').Page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await page.goto('/');
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
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
  await expect(page.getByText(/RFC duplicado/).first()).toBeVisible();

  // NOTA: el botón "Cerrar" del footer del panel (bottom-right) queda
  // detrás del FAB "Asistente IA" (ChatAsistente, fixed bottom-6
  // right-6 z-50 — mismo z-index que SideSheet, gana por orden de DOM)
  // y es realmente inclicable ahí, no solo un problema del test —
  // hallazgo de UX preexistente y no relacionado, fuera de alcance de
  // este change. Se usa la "X" del header del panel en su lugar, que no
  // tiene el problema.
  await page.getByRole('button', { name: 'Cerrar panel' }).click();

  // ── Confirmar que el catálogo se refrescó con los 2 clientes creados ───
  // (el catálogo real tiene decenas de clientes ordenados alfabéticamente;
  // se busca por RFC para no depender de la posición en la tabla)
  await page.getByPlaceholder('BUSCAR CLIENTES...').fill(`PWA${sufijo}`);
  await expect(page.getByText('Cliente Playwright Uno')).toBeVisible();
  await expect(page.getByText('Cliente Playwright Dos')).toBeVisible();

  fs.unlinkSync(csvPath);
});

test('usuario sin rol admin no ve "Importar CSV/Excel" y el endpoint responde 403', async ({ page }) => {
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  // comprador@alfa.bocam.com solo tiene el rol `procurement` — ni siquiera
  // tiene acceso al módulo Ventas (Layout.tsx exige rol `ventas`), lo cual
  // ya satisface "no ve el botón Importar CSV/Excel" de forma más fuerte
  // (no hay ningún seed user con rol `ventas` sin `admin` para probar el
  // caso "ve el módulo pero no el botón admin-only").
  await page.goto('/');
  await page.locator('#login-email-input').fill(COMPRADOR_EMAIL);
  await page.locator('#login-password-input').fill(COMPRADOR_PASSWORD);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 15_000 });

  await expect(page.getByRole('button', { name: 'Ventas', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Importar CSV/Excel' })).toHaveCount(0);

  const token = await page.evaluate(() => localStorage.getItem('iretum_access_token'));
  const resp = await page.request.post('/api/v1/ventas/clientes/importar-lote', {
    headers: { Authorization: `Bearer ${token}` },
    data: { registros: [{ rfc_tax_id: 'NOADMIN01', razon_social: 'No debería crearse' }] },
  });
  expect(resp.status()).toBe(403);
});
