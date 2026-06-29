/**
 * Tests de Integración: TransferenciaPartida
 *
 * Runner: npm run test:integration
 * Requiere: PostgreSQL + tabla transferencia_partidas creada
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

const TENANT_ID   = randomUUID();
const PROYECTO_ID = randomUUID();
const USER_ID     = randomUUID();

function token(roles = ['admin']) {
  return signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles });
}

async function api(path: string, opts: RequestInit = {}, roles = ['admin']) {
  const { default: fetch } = await import('node-fetch');
  return fetch(`${baseUrl}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token(roles)}`,
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
  await (prisma as any).transferenciaPartida.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.saldoMovimiento.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.saldoPartida.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.concepto.deleteMany({ where: { tenant_id: TENANT_ID } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: TENANT_ID } });
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function crearSaldo(opts: { monto: number; disponible?: number; estado?: string }): Promise<{ saldo: any; concepto_id: string }> {
  const concepto_id = randomUUID();
  const presupuesto = await prisma.presupuestoBase.create({
    data: { id: randomUUID(), tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, estado: 'BORRADOR', importe_total: 0 },
  });
  await prisma.concepto.create({
    data: {
      id: concepto_id,
      tenant_id: TENANT_ID,
      proyecto_id: PROYECTO_ID,
      presupuesto_id: presupuesto.id,
      clave: `TP-${randomUUID().substring(0, 6)}`,
      descripcion: 'Concepto test transferencia',
      unidad_medida: 'M2',
      cantidad: 1,
      precio_unitario: opts.monto,
      importe: opts.monto,
    },
  });
  const saldo = await prisma.saldoPartida.create({
    data: {
      id: randomUUID(),
      tenant_id:    TENANT_ID,
      proyecto_id:  PROYECTO_ID,
      concepto_id,
      concepto_clave: `TP-${randomUUID().substring(0, 6)}`,
      concepto_desc:  'Concepto test transferencia',
      monto_aprobado:    opts.monto,
      monto_disponible:  opts.disponible ?? opts.monto,
      monto_comprometido: 0,
      monto_ejercido:     0,
      monto_en_proceso:   0,
      estado_tope:  opts.estado ?? 'LIBRE',
    },
  });
  return { saldo, concepto_id };
}

const JUSTIFICACION_OK = 'Refuerzo estructural no previsto en APU original — requiere presupuesto adicional de partida de acabados';

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_crear_transferencia_valida() {
  const { concepto_id: origenId } = await crearSaldo({ monto: 100_000 });
  const { concepto_id: destinoId } = await crearSaldo({ monto: 50_000, disponible: 0, estado: 'BLOQUEADO' });

  const res = await api('/api/v1/gerencia-tecnica/transferencias-partida', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'INTERNA',
      concepto_origen_id:  origenId,
      concepto_destino_id: destinoId,
      monto: 30_000,
      justificacion: JUSTIFICACION_OK,
    }),
  });
  const body = (await res.json()) as any;
  assert.equal(res.status, 201, `Esperado 201, got ${res.status}: ${JSON.stringify(body)}`);
  assert.equal(body.data.estado, 'PENDIENTE');
  assert.equal(Number(body.data.monto), 30_000);
  console.log('  ✅ test_crear_transferencia_valida');
}

async function test_rechazar_saldo_insuficiente() {
  const { concepto_id: origenId } = await crearSaldo({ monto: 100_000, disponible: 10_000 });
  const { concepto_id: destinoId } = await crearSaldo({ monto: 50_000 });

  const res = await api('/api/v1/gerencia-tecnica/transferencias-partida', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'INTERNA',
      concepto_origen_id:  origenId,
      concepto_destino_id: destinoId,
      monto: 20_000,
      justificacion: JUSTIFICACION_OK,
    }),
  });
  assert.equal(res.status, 422);
  const body = (await res.json()) as any;
  assert.ok(body.error?.code === 'SALDO_INSUFICIENTE', `Expected SALDO_INSUFICIENTE, got: ${body.error?.code}`);
  console.log('  ✅ test_rechazar_saldo_insuficiente');
}

async function test_aprobar_ajusta_ambos_saldos() {
  const { concepto_id: origenId, saldo: saldoOrigenInicial } = await crearSaldo({ monto: 100_000 });
  const { concepto_id: destinoId, saldo: saldoDestinoInicial } = await crearSaldo({ monto: 50_000, disponible: 0, estado: 'BLOQUEADO' });

  // Crear transferencia
  const resCreate = await api('/api/v1/gerencia-tecnica/transferencias-partida', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'INTERNA',
      concepto_origen_id:  origenId,
      concepto_destino_id: destinoId,
      monto: 30_000,
      justificacion: JUSTIFICACION_OK,
    }),
  });
  const { data: transCreada } = (await resCreate.json()) as any;

  // Aprobar
  const resAprobar = await api(`/api/v1/gerencia-tecnica/transferencias-partida/${transCreada.id}/aprobar`, { method: 'PATCH' });
  assert.equal(resAprobar.status, 200, `Esperado 200 al aprobar, got ${resAprobar.status}`);
  const bodyAprobar = (await resAprobar.json()) as any;
  assert.equal(bodyAprobar.data.estado, 'APROBADA');

  // Verificar saldos
  const saldoOrigen  = await prisma.saldoPartida.findUnique({ where: { id: saldoOrigenInicial.id } });
  const saldoDestino = await prisma.saldoPartida.findUnique({ where: { id: saldoDestinoInicial.id } });

  assert.equal(Number(saldoOrigen!.monto_aprobado),   100_000 - 30_000, 'Origen debió decrementarse en 30,000');
  assert.equal(Number(saldoDestino!.monto_aprobado),   50_000  + 30_000, 'Destino debió incrementarse en 30,000');
  assert.equal(Number(saldoOrigen!.monto_disponible),  100_000 - 30_000);
  assert.equal(Number(saldoDestino!.monto_disponible),  0 + 30_000);
  console.log('  ✅ test_aprobar_ajusta_ambos_saldos');
}

async function test_rechazar_con_motivo() {
  const { concepto_id: origenId } = await crearSaldo({ monto: 100_000 });
  const { concepto_id: destinoId } = await crearSaldo({ monto: 50_000 });

  const resCreate = await api('/api/v1/gerencia-tecnica/transferencias-partida', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'INTERNA',
      concepto_origen_id:  origenId,
      concepto_destino_id: destinoId,
      monto: 10_000,
      justificacion: JUSTIFICACION_OK,
    }),
  });
  const { data: transCreada } = (await resCreate.json()) as any;

  const resRechazar = await api(`/api/v1/gerencia-tecnica/transferencias-partida/${transCreada.id}/rechazar`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo_rechazo: 'Sin holgura suficiente en la partida de acabados para esta transferencia' }),
  });
  assert.equal(resRechazar.status, 200);
  const body = (await resRechazar.json()) as any;
  assert.equal(body.data.estado, 'RECHAZADA');
  assert.ok(body.data.motivo_rechazo?.length > 0);
  console.log('  ✅ test_rechazar_con_motivo');
}

async function test_historial_partida_tiene_direccion() {
  const { concepto_id: origenId } = await crearSaldo({ monto: 200_000 });
  const { concepto_id: destinoId } = await crearSaldo({ monto: 50_000 });

  // Crear y aprobar
  const resCreate = await api('/api/v1/gerencia-tecnica/transferencias-partida', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'INTERNA',
      concepto_origen_id:  origenId,
      concepto_destino_id: destinoId,
      monto: 15_000,
      justificacion: JUSTIFICACION_OK,
    }),
  });
  const { data: t } = (await resCreate.json()) as any;
  await api(`/api/v1/gerencia-tecnica/transferencias-partida/${t.id}/aprobar`, { method: 'PATCH' });

  // Historial del origen
  const resOrigen = await api(`/api/v1/gerencia-tecnica/partidas/${origenId}/transferencias`);
  const historialOrigen = (await resOrigen.json()) as any;
  assert.ok(Array.isArray(historialOrigen.data));
  assert.ok(historialOrigen.data.some((h: any) => h.direccion === 'ENVIADA'));

  // Historial del destino
  const resDestino = await api(`/api/v1/gerencia-tecnica/partidas/${destinoId}/transferencias`);
  const historialDestino = (await resDestino.json()) as any;
  assert.ok(historialDestino.data.some((h: any) => h.direccion === 'RECIBIDA'));
  console.log('  ✅ test_historial_partida_tiene_direccion');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

const TESTS = [
  test_crear_transferencia_valida,
  test_rechazar_saldo_insuficiente,
  test_aprobar_ajusta_ambos_saldos,
  test_rechazar_con_motivo,
  test_historial_partida_tiene_direccion,
];

(async () => {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Integration Tests: TransferenciaPartida');
  console.log('══════════════════════════════════════════════════════\n');

  await setup();
  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    try {
      await test();
      passed++;
    } catch (err) {
      failed++;
      console.error(`  ❌ ${test.name}:`, err);
    }
  }

  await teardown();

  console.log(`\n  Resultado: ${passed}/${TESTS.length} tests pasaron\n`);
  if (failed > 0) process.exit(1);
})();
