import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

let finanzasServer: Server | undefined;
let finanzasBaseUrl = '';

async function setup() {
  const finanzasModule = await import('../../src/main');
  const finanzasStarted = await startHttpApp(finanzasModule.app);
  finanzasServer = finanzasStarted.server;
  finanzasBaseUrl = finanzasStarted.baseUrl;
}

async function testRoleForbiddenPresupuesto() {
  const token = signTenantToken({
    userId: 'user-resident',
    tenantId: 'tenant-seguridad-finanzas',
    proyectoId: 'proyecto-seguridad-finanzas',
    roles: ['resident'],
    projects: ['proyecto-seguridad-finanzas'],
    limiteAprobacion: 100000,
  });

  const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/presupuestos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      codigo: 'PRES-SEC-001',
      descripcion: 'Presupuesto no autorizado',
      monto_autorizado: 5000,
    }),
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_FORBIDDEN');
  console.log('ok - finanzas bloquea crear presupuesto por rol no autorizado');
}

async function testLimitExceededPresupuesto() {
  const token = signTenantToken({
    userId: 'user-finance',
    tenantId: 'tenant-seguridad-finanzas',
    proyectoId: 'proyecto-seguridad-finanzas',
    roles: ['finanzas'],
    projects: ['proyecto-seguridad-finanzas'],
    limiteAprobacion: 1000,
  });

  const response = await fetch(`${finanzasBaseUrl}/api/v1/finanzas/presupuestos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      codigo: 'PRES-SEC-002',
      descripcion: 'Presupuesto excedido',
      monto_autorizado: 2500,
      // MANO_OBRA es el único capítulo que aún se crea manualmente — los demás se
      // sincronizan desde GT (ver unificar-presupuesto-a-partidas-gt). Sin esto,
      // el gate de capítulo bloquearía la petición con 422 antes de llegar al
      // límite de autoridad financiera que este test quiere ejercitar.
      capitulo: 'MANO_OBRA',
    }),
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_LIMIT_EXCEEDED');
  console.log('ok - finanzas bloquea crear presupuesto por limite excedido');
}

// ─────────────────────────────────────────────────────────────────────────────
// Saga de fondos (ver openspec/changes/rbac-finanzas-saga-fondos)
//
// comprometer-fondos y liberar-fondos eran las dos unicas mutaciones del modulo
// sin ninguna comprobacion de rol: bastaba un JWT valido con acceso al proyecto
// para congelar o liberar dinero contra un presupuesto y disparar los eventos
// que Contabilidad usa para registrar y revertir pasivos.
// ─────────────────────────────────────────────────────────────────────────────

const TENANT_SAGA = 'tenant-seguridad-finanzas';
const PROYECTO_SAGA = 'proyecto-seguridad-finanzas';

function tokenConRoles(userId: string, roles: string[]): string {
  return signTenantToken({
    userId,
    tenantId: TENANT_SAGA,
    proyectoId: PROYECTO_SAGA,
    roles,
    projects: [PROYECTO_SAGA],
    limiteAprobacion: 999999999,
  });
}

async function postSaga(path: string, token: string, body: unknown) {
  return fetch(`${finanzasBaseUrl}/api/v1/finanzas/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function testRoleForbiddenComprometerFondos() {
  const response = await postSaga('comprometer-fondos', tokenConRoles('user-resident', ['resident']), {
    presupuesto_id: 'presupuesto-saga-001',
    monto: 250000,
    oc_id: 'oc-saga-001',
    oc_codigo: 'OC-SAGA-001',
    concepto: 'Compromiso no autorizado',
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'AUTH_FORBIDDEN');
  console.log('ok - finanzas bloquea comprometer fondos por rol no autorizado');
}

async function testRoleForbiddenLiberarFondos() {
  const response = await postSaga('liberar-fondos', tokenConRoles('user-hse', ['seguridad_hse']), {
    presupuesto_id: 'presupuesto-saga-001',
    monto: 250000,
    oc_id: 'oc-saga-001',
    oc_codigo: 'OC-SAGA-001',
    concepto: 'Liberacion no autorizada',
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'AUTH_FORBIDDEN');
  console.log('ok - finanzas bloquea liberar fondos por rol no autorizado');
}

// Compras llama a estos dos endpoints reenviando el JWT del usuario original, no
// una credencial de servicio. Si el conjunto de roles se estrecha a
// finanzas/admin, la emision de OC se rompe y las ordenes caen en ERROR_FINANZAS.
// Se envia el body vacio a proposito: la validacion de campos obligatorios
// responde 400 antes de tocar la base de datos, asi que un 400 prueba que la
// peticion paso el control de acceso sin necesidad de una BD viva.
async function testProcurementNoEsBloqueadoPorRol() {
  for (const path of ['comprometer-fondos', 'liberar-fondos']) {
    const response = await postSaga(path, tokenConRoles('user-procurement', ['procurement']), {});

    assert.notEqual(
      response.status,
      403,
      `${path} rechazo el rol procurement: rompe la saga Compras -> Finanzas`
    );
    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.error.code, 'FIN_MISSING_FIELDS');
  }
  console.log('ok - finanzas permite la saga de Compras con rol procurement');
}

async function main() {
  await setup();

  try {
    await testRoleForbiddenPresupuesto();
    await testLimitExceededPresupuesto();
    await testRoleForbiddenComprometerFondos();
    await testRoleForbiddenLiberarFondos();
    await testProcurementNoEsBloqueadoPorRol();
  } finally {
    await stopHttpApp(finanzasServer);
  }
}

void main().catch((error) => {
  console.error('not ok - finanzas seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});
