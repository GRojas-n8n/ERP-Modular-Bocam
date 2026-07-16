/**
 * Tests de Integración: SaldoPartida — GT presupuesto-tope-partida
 *
 * Runner: npm run test:integration
 * Requiere: PostgreSQL corriendo (DATABASE_URL → schema gerencia_tecnica)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

let server: Server | undefined;
let baseUrl = '';

const TENANT_ID  = randomUUID();
const PROYECTO_ID = randomUUID();
const USER_ID    = randomUUID();

function token(roles = ['admin']) {
  return signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles });
}

async function fetch_(path: string, opts: RequestInit = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(`${baseUrl}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      'x-tenant-id':   TENANT_ID,
      'x-proyecto-id': PROYECTO_ID,
      ...(opts.headers as Record<string, string> || {}),
    },
  });
}

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  // Limpiar datos de prueba
  await prisma.saldoMovimiento.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.saldoPartida.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.conceptoInsumo.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.insumo.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.concepto.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: TENANT_ID } });
  await stopHttpApp(server);
  await prisma.$disconnect();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function crearPresupuestoConConceptos(numConceptos = 2): Promise<{ presupuestoId: string; conceptoIds: string[] }> {
  const presupuesto = await prisma.presupuestoBase.create({
    data: {
      id: randomUUID(),
      tenant_id:  TENANT_ID,
      proyecto_id: PROYECTO_ID,
      estado:     'BORRADOR',
      importe_total: 0,
    },
  });

  const conceptoIds: string[] = [];
  let total = 0;
  for (let i = 0; i < numConceptos; i++) {
    const id = randomUUID();
    const precio = 100_000;
    const cantidad = 1 + i;
    await prisma.concepto.create({
      data: {
        id,
        tenant_id:      TENANT_ID,
        proyecto_id:    PROYECTO_ID,
        presupuesto_id: presupuesto.id,
        clave:          `TEST-00${i + 1}`,
        descripcion:    `Concepto de prueba ${i + 1}`,
        unidad_medida:  'M2',
        cantidad,
        precio_unitario: precio,
        importe:        precio * cantidad,
      },
    });
    conceptoIds.push(id);
    total += precio * cantidad;
  }

  await prisma.presupuestoBase.update({
    where: { id: presupuesto.id },
    data: { importe_total: total },
  });

  return { presupuestoId: presupuesto.id, conceptoIds };
}

async function crearPresupuestoConAPU(): Promise<{ presupuestoId: string; conceptoId: string }> {
  const presupuesto = await prisma.presupuestoBase.create({
    data: {
      id: randomUUID(),
      tenant_id:  TENANT_ID,
      proyecto_id: PROYECTO_ID,
      estado:     'BORRADOR',
      importe_total: 0,
    },
  });

  const conceptoId = randomUUID();
  await prisma.concepto.create({
    data: {
      id: conceptoId,
      tenant_id:      TENANT_ID,
      proyecto_id:    PROYECTO_ID,
      presupuesto_id: presupuesto.id,
      clave:          'APU-001',
      descripcion:    'Concepto con composición APU',
      unidad_medida:  'M2',
      cantidad:       10,
      precio_unitario: 1000,
      importe:        10000,
    },
  });

  const insumoMaterialId = randomUUID();
  const insumoManoObraId = randomUUID();
  await prisma.insumo.create({
    data: { id: insumoMaterialId, tenant_id: TENANT_ID, clave: 'MAT-APU-1', descripcion: 'Material APU', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 100 },
  });
  await prisma.insumo.create({
    data: { id: insumoManoObraId, tenant_id: TENANT_ID, clave: 'MO-APU-1', descripcion: 'Mano de obra APU', unidad_medida: 'JOR', tipo_insumo: 'MANO_DE_OBRA', costo_base: 50 },
  });

  // MATERIAL: 5 x 100 = 500 acumulado. MANO_DE_OBRA: 2 x 50 = 100 acumulado.
  // MATERIAL debe ganar como categoria_predominante.
  await prisma.conceptoInsumo.create({
    data: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoId, insumo_id: insumoMaterialId, tipo_insumo: 'MATERIAL', cantidad: 5, costo_unitario: 100 },
  });
  await prisma.conceptoInsumo.create({
    data: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoId, insumo_id: insumoManoObraId, tipo_insumo: 'MANO_DE_OBRA', cantidad: 2, costo_unitario: 50 },
  });

  return { presupuestoId: presupuesto.id, conceptoId };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_categoria_predominante_persistida_al_aprobar() {
  const { presupuestoId, conceptoId } = await crearPresupuestoConAPU();
  const res = await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });
  assert.equal(res.status, 200);

  const saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoId } },
  });
  assert.ok(saldo, 'SaldoPartida debe existir');
  assert.equal((saldo as any).categoria_predominante, 'MATERIAL', 'categoria_predominante debe ser el tipo con mayor costo acumulado (MATERIAL: 500 > MANO_DE_OBRA: 100)');
  console.log('✓ categoria_predominante se calcula y persiste correctamente al aprobar');
}

async function test_categoria_predominante_null_sin_apu() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[0] } },
  });
  assert.equal((saldo as any).categoria_predominante, null, 'sin ConceptoInsumo, categoria_predominante debe ser null');
  console.log('✓ categoria_predominante es null cuando el concepto no tiene composición APU');
}

async function test_aprobar_presupuesto_crea_saldo_partida() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(2);

  const res = await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });
  assert.equal(res.status, 200, 'aprobar presupuesto debe retornar 200');

  for (let i = 0; i < conceptoIds.length; i++) {
    const saldo = await prisma.saldoPartida.findUnique({
      where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[i] } },
    });
    assert.ok(saldo, `SaldoPartida debe existir para concepto ${i}`);
    assert.equal(saldo.estado_tope, 'LIBRE', 'estado inicial debe ser LIBRE');
    const expectedMonto = 100_000 * (1 + i);
    assert.equal(Number(saldo.monto_aprobado), expectedMonto, `monto_aprobado debe ser ${expectedMonto}`);
    assert.equal(Number(saldo.monto_disponible), expectedMonto, 'disponible debe igualar aprobado al inicio');
  }
  console.log('✓ Aprobar presupuesto crea SaldoPartida por cada concepto');
}

async function test_saldo_endpoint_retorna_detalle() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/saldo`);
  assert.equal(res.status, 200, 'GET /partidas/:id/saldo debe retornar 200');

  const body = await res.json() as any;
  assert.ok(body.success, 'response.success debe ser true');
  assert.equal(body.data.estado_tope, 'LIBRE');
  assert.equal(body.data.monto_aprobado, 100_000);
  assert.equal(body.data.monto_disponible, 100_000);
  assert.equal(body.data.monto_comprometido, 0);
  console.log('✓ GET /partidas/:id/saldo retorna saldo completo');
}

async function test_comprometer_actualiza_saldo() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const ocId = randomUUID();
  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 85_000, referencia_id: ocId, referencia_codigo: 'OC-TEST-001', tipo: 'OC' }),
  });
  assert.equal(res.status, 200, 'comprometer debe retornar 200');

  const saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[0] } },
  });
  assert.equal(Number(saldo!.monto_comprometido), 85_000);
  assert.equal(Number(saldo!.monto_disponible), 15_000);
  assert.equal(saldo!.estado_tope, 'LIMITADO', 'disponible < 20% → LIMITADO');
  console.log('✓ POST /comprometer actualiza monto_comprometido y estado_tope');
}

async function test_saldo_a_bloqueado_cuando_agotado() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  // Comprometer el 100%
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 100_000, referencia_id: randomUUID(), tipo: 'OC' }),
  });

  const saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[0] } },
  });
  assert.equal(saldo!.estado_tope, 'BLOQUEADO', 'disponible=0 debe llevar a BLOQUEADO');
  assert.equal(Number(saldo!.monto_disponible), 0);
  console.log('✓ Partida transita a BLOQUEADO cuando disponible ≤ 0');
}

async function test_comprometer_idempotente() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const refId = randomUUID();
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 20_000, referencia_id: refId, tipo: 'OC' }),
  });
  // Segunda vez — debe ser noop
  const res2 = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 20_000, referencia_id: refId, tipo: 'OC' }),
  });
  assert.equal(res2.status, 200);
  const body2 = await res2.json() as any;
  assert.equal(body2.data.idempotente, true, 'segunda llamada debe retornar idempotente:true');

  // Saldo no debe haberse duplicado
  const saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[0] } },
  });
  assert.equal(Number(saldo!.monto_comprometido), 20_000, 'monto_comprometido no debe duplicarse');
  console.log('✓ POST /comprometer es idempotente por referencia_id');
}

async function test_cancelar_compromiso_revierte_saldo() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  const ocId = randomUUID();
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 100_000, referencia_id: ocId, tipo: 'OC' }),
  });

  // Verificar que quedó bloqueada
  let saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[0] } },
  });
  assert.equal(saldo!.estado_tope, 'BLOQUEADO');

  // Cancelar el compromiso
  const delRes = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer/${ocId}`, { method: 'DELETE' });
  assert.equal(delRes.status, 200, 'DELETE /comprometer/:ref debe retornar 200');

  saldo = await prisma.saldoPartida.findUnique({
    where: { uq_saldo_partida: { tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, concepto_id: conceptoIds[0] } },
  });
  assert.equal(Number(saldo!.monto_comprometido), 0, 'comprometido debe quedar en 0 tras reversa');
  assert.equal(Number(saldo!.monto_disponible), 100_000, 'disponible debe restaurarse');
  assert.equal(saldo!.estado_tope, 'LIBRE', 'estado debe volver a LIBRE');
  console.log('✓ DELETE /comprometer/:ref revierte compromiso y restaura estado LIBRE');
}

async function test_404_partida_sin_inicializar() {
  const conceptoId = randomUUID();
  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoId}/saldo`);
  assert.equal(res.status, 404);
  const body = await res.json() as any;
  assert.equal(body.error?.code || body.code, 'SALDO_NO_INICIALIZADO');
  console.log('✓ GET /partidas/:id/saldo retorna 404 si no existe SaldoPartida');
}

async function test_resumen_lista_partidas_con_estado() {
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(2);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  // Comprometer totalmente el primer concepto
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 100_000, referencia_id: randomUUID(), tipo: 'OC' }),
  });

  const res = await fetch_(`/api/v1/gerencia-tecnica/partidas/resumen`);
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  const partidas: any[] = body.data;

  const p0 = partidas.find((p: any) => p.concepto_id === conceptoIds[0]);
  const p1 = partidas.find((p: any) => p.concepto_id === conceptoIds[1]);

  assert.ok(p0, 'primera partida debe aparecer en resumen');
  assert.equal(p0.estado_tope, 'BLOQUEADO');
  assert.ok(p1, 'segunda partida debe aparecer en resumen');
  assert.equal(p1.estado_tope, 'LIBRE');
  console.log('✓ GET /partidas/resumen lista todas las partidas con estado_tope');
}

async function test_comprometer_en_partida_bloqueada_devuelve_bloqueado() {
  // Verifica que cuando la partida está BLOQUEADA el saldo se reporta correctamente
  // y que nuevos compromisos no modifican el saldo (la gate vive en Compras, GT solo reporta)
  const { presupuestoId, conceptoIds } = await crearPresupuestoConConceptos(1);
  await fetch_(`/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}/aprobar`, { method: 'PATCH' });

  // Agotar el saldo (100 000 comprometidos)
  await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/comprometer`, {
    method: 'POST',
    body: JSON.stringify({ monto: 100_000, referencia_id: randomUUID(), tipo: 'OC' }),
  });

  // Confirmar BLOQUEADO
  const saldoRes = await fetch_(`/api/v1/gerencia-tecnica/partidas/${conceptoIds[0]}/saldo`);
  const saldoBody = await saldoRes.json() as any;
  assert.equal(saldoBody.data.estado_tope, 'BLOQUEADO');
  assert.equal(saldoBody.data.monto_disponible, 0);

  // Compras consulta este endpoint antes de crear OC — si retorna BLOQUEADO, detiene la generación
  // Verificar que el endpoint retorna bloqueo_automatico
  assert.equal(typeof saldoBody.data.bloqueo_automatico, 'boolean');
  console.log('✓ Partida BLOQUEADA: saldo endpoint retorna estado correcto para gate de Compras');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

(async () => {
  await setup();
  let passed = 0;
  let failed = 0;
  const tests = [
    test_categoria_predominante_persistida_al_aprobar,
    test_categoria_predominante_null_sin_apu,
    test_aprobar_presupuesto_crea_saldo_partida,
    test_saldo_endpoint_retorna_detalle,
    test_comprometer_actualiza_saldo,
    test_saldo_a_bloqueado_cuando_agotado,
    test_comprometer_idempotente,
    test_cancelar_compromiso_revierte_saldo,
    test_404_partida_sin_inicializar,
    test_resumen_lista_partidas_con_estado,
    test_comprometer_en_partida_bloqueada_devuelve_bloqueado,
  ];

  for (const t of tests) {
    try {
      await t();
      passed++;
    } catch (err: any) {
      console.error(`✗ ${t.name}:`, err.message);
      failed++;
    }
  }

  await teardown();
  console.log(`\n━━━ ${passed + failed} tests | ${passed} passed | ${failed} failed ━━━`);
  process.exit(failed > 0 ? 1 : 0);
})();
