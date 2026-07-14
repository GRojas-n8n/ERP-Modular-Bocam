import { test, expect } from '@playwright/test';

/**
 * ---------------------------------------------------------------------------
 * Verificación E2E: tras firmar un Cuadro Comparativo, el botón "Enviar al
 * Gerente Técnico →" aparece y el cuadro llega a la bandeja de pendientes GT.
 *
 * Spec:  openspec/changes/fix-boton-enviar-gt-tras-firma/
 * Tarea: 1.1 del tasks.md — escrito ANTES del fix, primero en rojo.
 *
 * Bug: showEnviarGTBtn en ComparativaDetail.tsx solo comprobaba estado ===
 * 'EVALUADO_TECNICAMENTE' o 'LOCKED' — ninguno de los dos es alcanzable por
 * ningún endpoint real (grep exhaustivo confirmó cero asignaciones). El
 * estado real que deja la firma es FIRMADO_BLOQUEADO, que la condición no
 * contemplaba — el botón nunca se mostraba tras una firma real, para NINGÚN
 * cuadro.
 *
 * Requiere levantados: apps/auth (3003), apps/compras (3002), apps/app-shell (3000)
 * Usuarios de prueba (seed de apps/auth): residente@alfa.bocam.com / Res.2026 (residencia)
 *                                          admin@alfa.bocam.com / Admin.2026 (admin, superintendent)
 * Datos: sembrados vía apps/compras/scratch-seed-firma-gt.ts (Requisicion APROBADA +
 * item texto libre + CuadroComparativo EN_EVALUACION_TECNICA con 1 proveedor ya evaluado
 * C) — la selección de 1ª opción, el veredicto y el proveedor sugerido se completan en
 * el test vía UI (no sembrados directo en BD) porque normalizeComp en ComprasView.tsx no
 * propaga veredicto_residente/proveedores_sugeridos/primera_opcion_proveedor_id al cargar
 * la lista — sembrarlos no tendría efecto en el estado que ve React al abrir el panel.
 * ---------------------------------------------------------------------------
 */

const RESIDENTE_EMAIL = 'residente@alfa.bocam.com';
const RESIDENTE_PASSWORD = 'Res.2026';
const GT_EMAIL = 'admin@alfa.bocam.com';
const GT_PASSWORD = 'Admin.2026';

const FOLIO = process.env.E2E_GT_FOLIO!;
const PROV_NOMBRE = process.env.E2E_GT_PROV_NOMBRE!;

async function login(page: import('@playwright/test').Page, email: string, password: string, homeButton: string) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('#login-email-input').fill(email);
  await page.locator('#login-password-input').fill(password);
  await page.locator('#login-submit-btn').click();
  await expect(page.getByRole('button', { name: homeButton, exact: true })).toBeVisible({ timeout: 15_000 });
}

test('tras firmar, "Enviar al Gerente Técnico" es visible y el cuadro llega a la bandeja del GT', async ({ page }) => {
  test.skip(!FOLIO || !PROV_NOMBRE, 'Requiere seed previo — ver scratch-seed-firma-gt.ts');
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  // ── 1. Residente: abrir el cuadro en Eval. Técnica ───────────────────────
  await login(page, RESIDENTE_EMAIL, RESIDENTE_PASSWORD, 'Compras');
  await page.getByRole('button', { name: 'Compras', exact: true }).click();
  await page.getByRole('button', { name: 'Eval. Técnica', exact: true }).click();

  const pendienteCard = page.locator('div')
    .filter({ has: page.getByText(FOLIO) })
    .filter({ has: page.getByRole('button', { name: 'Evaluar →' }) })
    .last();
  await pendienteCard.getByRole('button', { name: 'Evaluar →' }).click();

  // ── 1ª opción de proveedor, veredicto y proveedor sugerido (todo vía UI) ──
  await page.locator('select').first().selectOption({ label: `A · ${PROV_NOMBRE}` });
  await page.getByRole('button', { name: 'Guardar selección' }).click();
  await expect(page.getByText(/Selección guardada: 1ª opción/)).toBeVisible({ timeout: 10_000 });

  await page.getByPlaceholder(/Describe tu evaluación general/).fill('Proveedor cumple todas las especificaciones técnicas.');
  await page.getByRole('button', { name: new RegExp(`A · ${PROV_NOMBRE}`) }).click();

  // ── Firmar ────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: '🔒 Firmar y Bloquear →' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '🔒 Firmar y Bloquear', exact: true }).click();
  await expect(page.getByText('🔒 Firmar Evaluación Técnica')).toHaveCount(0, { timeout: 10_000 });

  // ── 2. El botón "Enviar al Gerente Técnico" debe estar visible AHORA (estado FIRMADO_BLOQUEADO) ──
  await expect(page.getByRole('button', { name: 'Enviar al Gerente Técnico →' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Enviar al Gerente Técnico →' }).click();
  await expect(page.getByText('Enviando...')).toHaveCount(0, { timeout: 10_000 });

  // ── 3. GT (superintendent): el cuadro debe aparecer en su bandeja de pendientes ──
  await login(page, GT_EMAIL, GT_PASSWORD, 'Compras');
  await page.getByRole('button', { name: 'Compras', exact: true }).click();
  await page.getByRole('button', { name: 'Aprob. GT', exact: true }).click();
  await expect(page.getByText(FOLIO).last()).toBeVisible({ timeout: 10_000 });
});
