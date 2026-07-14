import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: importación masiva de Proveedores desde CSV/Excel
 * Spec:  openspec/changes/carga-masiva-proveedores-compras/
 * Tarea: 4.1 del tasks.md (verificación manual en navegador)
 *
 * Requiere levantados: apps/auth (3003), apps/compras (3002), apps/app-shell (3000)
 * Usuario de prueba (seed de apps/auth): comprador@alfa.bocam.com / Comp.2026 (procurement)
 * ---------------------------------------------------------------------------
 */

const PROCUREMENT_EMAIL = 'comprador@alfa.bocam.com';
const PROCUREMENT_PASSWORD = 'Comp.2026';
const ADMIN_EMAIL = 'admin@alfa.bocam.com';
const ADMIN_PASSWORD = 'Admin.2026';

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/');
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: 'Compras', exact: true })).toBeVisible({ timeout: 15_000 });
}

test('procurement importa un lote de Proveedores con filas válidas, inválidas y RFC duplicado (distinto case)', async ({ page }) => {
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await login(page, PROCUREMENT_EMAIL, PROCUREMENT_PASSWORD);

  await page.getByRole('button', { name: 'Compras', exact: true }).click();
  await page.getByRole('button', { name: 'Proveedores', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Importar CSV/Excel' })).toBeVisible();

  // ── Preparar CSV: 2 válidos, 1 sin razon_social, 2 con RFC duplicado
  //    (mismo RFC en distinto case, para probar la normalización) ──────────
  const sufijo = Date.now().toString().slice(-8);
  const csvContent = [
    'rfc_tax_id,razon_social,email_contacto,telefono,calificacion_desempeno',
    `pwp${sufijo}1,Proveedor Playwright Uno,contacto1@example.com,5551234567,4.5`,
    `PWP${sufijo}2,Proveedor Playwright Dos,,`,
    `PWP${sufijo}3,,sin.razon@example.com,`,
    `pwp${sufijo}dup,Proveedor Duplicado A,,`,
    `PWP${sufijo}DUP,Proveedor Duplicado B,,`,
  ].join('\n');
  const csvPath = path.join(os.tmpdir(), `proveedores-e2e-${sufijo}.csv`);
  fs.writeFileSync(csvPath, csvContent, 'utf-8');

  // ── Subir el archivo ───────────────────────────────────────────────────
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(csvPath);

  // ── Vista previa: 2 listos, 3 con error ─────────────────────────────────
  await expect(page.getByText('Vista previa — Importación de Proveedores')).toBeVisible();
  const listosCount = page.locator('text=Listos para importar').locator('..').locator('p').first();
  await expect(listosCount).toHaveText('2');
  const conErrorCount = page.locator('text=Con error').locator('..').locator('p').first();
  await expect(conErrorCount).toHaveText('3');

  // ── Confirmar importación ──────────────────────────────────────────────
  await page.getByRole('button', { name: /Importar \d+ registros?/ }).click();

  // ── Resultado: 2 creados, 3 errores ────────────────────────────────────
  await expect(page.getByText('Resultado de la importación')).toBeVisible({ timeout: 10_000 });
  const creadosCount = page.locator('text=Proveedores creados').locator('..').locator('p').first();
  await expect(creadosCount).toHaveText('2');
  const erroresCount = page.locator('text=Filas con error').locator('..').locator('p').first();
  await expect(erroresCount).toHaveText('3');
  await expect(page.getByText(/RFC duplicado/).first()).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar panel' }).click();

  // ── Confirmar que el catálogo se refrescó con los 2 proveedores creados ─
  await page.getByPlaceholder('Buscar proveedor por nombre o RFC...').fill(`PWP${sufijo}`);
  await expect(page.getByText('Proveedor Playwright Uno')).toBeVisible();
  await expect(page.getByText('Proveedor Playwright Dos')).toBeVisible();

  fs.unlinkSync(csvPath);
});

test('superintendent ve la tab Proveedores pero no el botón "Importar CSV/Excel", y el endpoint responde 403', async ({ page, request }) => {
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  // `comprador@alfa.bocam.com` no tiene un usuario seed "superintendent puro"
  // (admin@alfa ya trae ['admin','superintendent'], lo que enmascararía el
  // gate porque `admin` sí puede importar) — se le cambia el rol
  // temporalmente vía el endpoint admin (mismo patrón usado en sesiones
  // anteriores para bugs dependientes de rol exacto) y se revierte al final.
  const TENANT_ALFA_ID = '11111111-aaaa-bbbb-cccc-111111111111';
  const adminLoginResp = await request.post('http://localhost:3003/api/v1/auth/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, tenant_id: TENANT_ALFA_ID },
  });
  const adminToken = (await adminLoginResp.json()).data.access_token;

  const usersResp = await request.get('http://localhost:3003/api/v1/auth/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const comprador = (await usersResp.json()).data.find((u: any) => u.email === PROCUREMENT_EMAIL);

  await request.patch(`http://localhost:3003/api/v1/auth/admin/users/${comprador.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { roles: ['superintendent'] },
  });

  try {
    await page.goto('/');
    await page.locator('#login-email-input').fill(PROCUREMENT_EMAIL);
    await page.locator('#login-password-input').fill(PROCUREMENT_PASSWORD);
    await page.locator('#login-submit-btn').click();
    await expect(page.getByRole('button', { name: 'Compras', exact: true })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Compras', exact: true }).click();
    await page.getByRole('button', { name: 'Proveedores', exact: true }).click();
    // Sí tiene acceso a la tab (isProcurement incluye 'superintendent')...
    await expect(page.getByPlaceholder('Buscar proveedor por nombre o RFC...')).toBeVisible();
    // ...pero NO el botón de importar (puedeImportarProveedores solo admite 'procurement'/'admin').
    await expect(page.getByRole('button', { name: 'Importar CSV/Excel' })).toHaveCount(0);

    const token = await page.evaluate(() => localStorage.getItem('iretum_access_token'));
    const resp = await page.request.post('/api/v1/compras/proveedores/importar-lote', {
      headers: { Authorization: `Bearer ${token}` },
      data: { registros: [{ rfc_tax_id: 'NOSUPER01', razon_social: 'No debería crearse' }] },
    });
    expect(resp.status()).toBe(403);
  } finally {
    await request.patch(`http://localhost:3003/api/v1/auth/admin/users/${comprador.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { roles: ['procurement'] },
    });
  }
});
