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

// ─────────────────────────────────────────────────────────────────────────────
// Limite de Autoridad Financiera (ver openspec/changes/limite-autoridad-pagos-oc)
//
// El modulo declara en su cabecera "Limites de Autoridad Financiera validados
// antes de mutaciones", pero solo lo hacia en 3 de 13. Faltaba en el camino que
// usa la interfaz: POST /pagos-oc descuenta el saldo de la cuenta bancaria sin
// mirar el limite, mientras PATCH /pagos/:id/pagar — mismo efecto por el otro
// camino — si lo valida. Los tres casos de abajo cubren el bypass.
//
// Todos usan rol 'finanzas' (autorizado) y limite bajo, para aislar el limite
// del control de rol. El rechazo ocurre antes de tocar la BD, asi que no hace
// falta Postgres.
// ─────────────────────────────────────────────────────────────────────────────

function tokenConLimite(userId: string, limiteAprobacion: number): string {
  return signTenantToken({
    userId,
    tenantId: TENANT_SAGA,
    proyectoId: PROYECTO_SAGA,
    roles: ['finanzas'],
    projects: [PROYECTO_SAGA],
    limiteAprobacion,
  });
}

async function postFinanzas(path: string, token: string, body: unknown) {
  return fetch(`${finanzasBaseUrl}/api/v1/finanzas/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function testLimiteExcedidoPagoOC() {
  const response = await postFinanzas('pagos-oc', tokenConLimite('user-finanzas-limitado', 1000), {
    fuente: 'CUENTA_BANCARIA',
    cuenta_id: 'cuenta-saga-001',
    tipo_pago: 'TRANSFERENCIA',
    referencia: 'TRF-LIM-001',
    concepto: 'Pago de OC por encima del limite',
    fecha_pago: '2026-08-19',
    proyecto_id: PROYECTO_SAGA,
    detalles: [
      { oc_id: 'oc-lim-001', oc_codigo: 'OC-LIM-001', monto_aplicado: 1500 },
      { oc_id: 'oc-lim-002', oc_codigo: 'OC-LIM-002', monto_aplicado: 1000 },
    ],
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_LIMIT_EXCEEDED');
  console.log('ok - finanzas bloquea pago de OC por limite de autoridad excedido');
}

async function testLimiteExcedidoAnticipo() {
  const token = tokenConLimite('user-finanzas-limitado', 1000);
  const response = await fetch(
    `${finanzasBaseUrl}/api/v1/finanzas/proyectos/${PROYECTO_SAGA}/anticipo`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ anticipo_total: 250000 }),
    }
  );

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_LIMIT_EXCEEDED');
  console.log('ok - finanzas bloquea anticipo por limite de autoridad excedido');
}

async function testLimiteExcedidoTransferencia() {
  const response = await postFinanzas('transferencias-presupuestales', tokenConLimite('user-finanzas-limitado', 1000), {
    presupuesto_origen_id: 'presupuesto-origen-001',
    presupuesto_destino_id: 'presupuesto-destino-001',
    monto: 50000,
    concepto: 'Transferencia por encima del limite',
  });

  assert.equal(response.status, 403);
  const payload = await response.json();
  assert.equal(payload.error.code, 'FIN_LIMIT_EXCEEDED');
  console.log('ok - finanzas bloquea transferencia por limite de autoridad excedido');
}

// No-regresion: con limite holgado la peticion debe pasar el gate del limite y
// seguir a la validacion de negocio. Se envia body incompleto a proposito para
// detenerla en el 400 de campos obligatorios sin necesidad de BD.
async function testLimiteHolgadoNoBloquea() {
  const response = await postFinanzas('pagos-oc', tokenConLimite('user-finanzas-amplio', 999999999), {});

  assert.notEqual(response.status, 403, 'pagos-oc rechazo por limite a un usuario con limite suficiente');
  assert.equal(response.status, 400);
  console.log('ok - finanzas no bloquea por limite cuando el limite alcanza');
}

// ─────────────────────────────────────────────────────────────────────────────
// Lecturas (ver openspec/changes/rbac-finanzas-lecturas)
//
// Las 8 rutas GET del modulo no exigian rol. La mas expuesta era /dashboard: la
// llama la pantalla de inicio, que no filtra por rol, asi que cualquier usuario
// autenticado veia el resumen presupuestal del proyecto al entrar.
//
// Los casos "permite" existen porque varias lecturas tienen consumidores
// cruzados y su conjunto de roles no puede estrecharse sin romperlos.
// ─────────────────────────────────────────────────────────────────────────────

async function getFinanzas(path: string, roles: string[]) {
  const token = tokenConRoles(`user-${roles.join('-')}`, roles);
  return fetch(`${finanzasBaseUrl}/api/v1/finanzas/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function testLecturasBloqueadasPorRol() {
  const casos: Array<[string, string[]]> = [
    ['dashboard',                              ['seguridad_hse']],
    ['dashboard',                              ['calidad']],
    ['pagos',                                  ['warehouse']],
    ['presupuestos',                           ['seguridad_hse']],
    ['presupuestos/presupuesto-x',             ['calidad']],
    ['suficiencia',                            ['seguridad_hse']],
    ['presupuestos/por-concepto/concepto-x',   ['calidad']],
    ['movimientos',                            ['seguridad_hse']],
  ];

  for (const [path, roles] of casos) {
    const response = await getFinanzas(path, roles);
    assert.equal(response.status, 403, `${path} no bloqueo al rol ${roles.join(',')}`);
    const payload = await response.json();
    assert.equal(payload.error.code, 'AUTH_FORBIDDEN');
  }
  console.log('ok - finanzas bloquea las lecturas directas a roles sin acceso');
}

// Cada uno de estos roles alcanza la lectura por un consumidor legitimo:
// procurement via Compras (convertir-oc), gerencia_tecnica via InsumosView y
// control_obra via ControlObraView (ambos montan ControlPresupuestalTabla).
// Un 403 aqui significa que se rompio ese camino.
async function testLecturasPermitidasAConsumidoresCruzados() {
  const casos: Array<[string, string[]]> = [
    ['suficiencia',                          ['procurement']],
    ['presupuestos/por-concepto/concepto-x', ['procurement']],
    ['movimientos',                          ['gerencia_tecnica']],
    ['movimientos',                          ['control_obra']],
    ['movimientos',                          ['control_proyectos']],
    ['dashboard',                            ['superintendent']],
    ['dashboard',                            ['finanzas']],
  ];

  for (const [path, roles] of casos) {
    const response = await getFinanzas(path, roles);
    assert.notEqual(
      response.status,
      403,
      `${path} rechazo al rol ${roles.join(',')}: rompe un consumidor legitimo`
    );
  }
  console.log('ok - finanzas permite las lecturas a sus consumidores cruzados');
}

// /reportes/pagado-por-concepto es la unica lectura que ademas exige la cabecera
// X-Internal-Service: solo se alcanza desde gerencia-tecnica. Se le agrego rol
// como defensa en profundidad — una cabecera es falsificable por si sola.
async function testReporteB2BExigeCabeceraYRol() {
  const token = tokenConRoles('user-gt', ['gerencia_tecnica']);
  const url = `${finanzasBaseUrl}/api/v1/finanzas/reportes/pagado-por-concepto?proyectoId=${PROYECTO_SAGA}`;

  const sinCabecera = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(sinCabecera.status, 403);

  const rolNoAutorizado = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tokenConRoles('user-hse', ['seguridad_hse'])}`,
      'X-Internal-Service': 'gerencia-tecnica',
    },
  });
  assert.equal(rolNoAutorizado.status, 403);
  const payload = await rolNoAutorizado.json();
  assert.equal(payload.error.code, 'AUTH_FORBIDDEN');

  const legitima = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-Internal-Service': 'gerencia-tecnica' },
  });
  assert.notEqual(legitima.status, 403, 'se rompio el consumo b2b desde gerencia-tecnica');

  console.log('ok - finanzas exige cabecera interna y rol en el reporte b2b');
}

async function main() {
  await setup();

  try {
    await testRoleForbiddenPresupuesto();
    await testLimitExceededPresupuesto();
    await testRoleForbiddenComprometerFondos();
    await testRoleForbiddenLiberarFondos();
    await testProcurementNoEsBloqueadoPorRol();
    await testLimiteExcedidoPagoOC();
    await testLimiteExcedidoAnticipo();
    await testLimiteExcedidoTransferencia();
    await testLimiteHolgadoNoBloquea();
    await testLecturasBloqueadasPorRol();
    await testLecturasPermitidasAConsumidoresCruzados();
    await testReporteB2BExigeCabeceraYRol();
  } finally {
    await stopHttpApp(finanzasServer);
  }
}

void main().catch((error) => {
  console.error('not ok - finanzas seguridad E2E');
  console.error(error);
  process.exitCode = 1;
});
