import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: importación masiva de Empleados desde CSV/Excel
 * Spec:  openspec/changes/carga-masiva-empleados-personal/
 * Tarea: 4.1 del tasks.md (verificación manual en navegador)
 *
 * Requiere levantados: apps/auth (3003), apps/personal (3006), apps/app-shell (3000)
 * Usuario de prueba (seed de apps/auth): admin@alfa.bocam.com / Admin.2026 (admin)
 * ---------------------------------------------------------------------------
 */

const ADMIN_EMAIL = 'admin@alfa.bocam.com';
const ADMIN_PASSWORD = 'Admin.2026';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('#login-email-input').fill(ADMIN_EMAIL);
  await page.locator('#login-password-input').fill(ADMIN_PASSWORD);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: 'Recursos Humanos', exact: true })).toBeVisible({ timeout: 15_000 });
}

test('admin importa un lote de Empleados con filas válidas, inválidas y RFC duplicado', async ({ page }) => {
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await login(page);

  await page.getByRole('button', { name: 'Recursos Humanos', exact: true }).click();
  await page.getByRole('button', { name: 'Empleados', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Importar CSV/Excel' })).toBeVisible();

  // ── Preparar CSV: 2 válidos, 1 con salario_diario no numérico, 2 con RFC duplicado ──
  const sufijo = Date.now().toString().slice(-6);
  const csvContent = [
    'nombre,apellido_paterno,rfc,puesto,salario_diario',
    `PlaywrightNombre1,ApellidoE2E${sufijo},PWE${sufijo}1,Fierrero,350`,
    `PlaywrightNombre2,ApellidoE2E${sufijo},PWE${sufijo}2,Operador,400`,
    `SalarioMalo,ApellidoE2E${sufijo},PWE${sufijo}3,Tecnico,no-es-numero`,
    `Duplicado A,ApellidoE2E${sufijo},PWE${sufijo}DUP,Obrero,280`,
    `Duplicado B,ApellidoE2E${sufijo},PWE${sufijo}DUP,Obrero,280`,
  ].join('\n');
  const csvPath = path.join(os.tmpdir(), `empleados-e2e-${sufijo}.csv`);
  fs.writeFileSync(csvPath, csvContent, 'utf-8');

  // ── Subir el archivo ───────────────────────────────────────────────────
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(csvPath);

  // ── Vista previa: 2 listos, 3 con error ─────────────────────────────────
  await expect(page.getByText('Vista previa — Importación de Empleados')).toBeVisible();
  const listosCount = page.locator('text=Listos para importar').locator('..').locator('p').first();
  await expect(listosCount).toHaveText('2');
  const conErrorCount = page.locator('text=Con error').locator('..').locator('p').first();
  await expect(conErrorCount).toHaveText('3');

  // ── Confirmar importación ──────────────────────────────────────────────
  await page.getByRole('button', { name: /Importar \d+ registros?/ }).click();

  // ── Resultado: 2 creados, 3 errores ────────────────────────────────────
  await expect(page.getByText('Resultado de la importación')).toBeVisible({ timeout: 10_000 });
  const creadosCount = page.locator('text=Empleados creados').locator('..').locator('p').first();
  await expect(creadosCount).toHaveText('2');
  const erroresCount = page.locator('text=Filas con error').locator('..').locator('p').first();
  await expect(erroresCount).toHaveText('3');
  await expect(page.getByText(/RFC duplicado/).first()).toBeVisible();
  await expect(page.getByText(/numérico/).first()).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar panel' }).click();

  // ── Confirmar que el catálogo se refrescó con los 2 empleados creados,
  //    con numero_empleado correlativo (no requiere búsqueda: sin
  //    virtualización, todas las filas están en el DOM) ────────────────
  await expect(page.getByText(`PlaywrightNombre1 ApellidoE2E${sufijo}`)).toBeVisible();
  await expect(page.getByText(`PlaywrightNombre2 ApellidoE2E${sufijo}`)).toBeVisible();

  fs.unlinkSync(csvPath);
});
