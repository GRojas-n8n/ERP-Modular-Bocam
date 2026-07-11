/**
 * Tests de Integración: Control de Proyectos
 *
 * Runner: npm run test:integration
 * Requiere: PostgreSQL + tablas control-proyectos creadas (prisma db push)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const DB_URL =
  process.env.CONTROL_PROYECTOS_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=control_proyectos';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

let server: Server | undefined;
let baseUrl = '';

const TENANT_ID   = randomUUID();
const PROYECTO_ID = randomUUID();
const USER_ID     = randomUUID();

function token(roles = ['admin']) {
  return signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles });
}

async function api(path: string, opts: Omit<RequestInit, 'body'> & { body?: string } = {}, roles = ['admin']) {
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
  await createTenantContext({ tenantId: TENANT_ID, proyectoId: PROYECTO_ID, userId: USER_ID }, async (tx) => {
    await tx.alertaProyecto.deleteMany({ where: { tenant_id: TENANT_ID } });
    await tx.programacionObra.deleteMany({ where: { tenant_id: TENANT_ID } });
    await tx.proyeccionCierre.deleteMany({ where: { tenant_id: TENANT_ID } });
  });
  await stopHttpApp(server);
  await prisma.$disconnect();
}

const CONCEPTO_ID = randomUUID();
const CURVA_VALIDA = [
  { semana: '2026-W20', pct_acumulado: 20 },
  { semana: '2026-W21', pct_acumulado: 50 },
  { semana: '2026-W22', pct_acumulado: 80 },
  { semana: '2026-W23', pct_acumulado: 100 },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

async function test_dashboard_sin_programacion() {
  const res = await api('/api/v1/control-proyectos/dashboard');
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.success, true);
  assert.equal(body.data.sin_programacion, true);
  assert.equal(body.data.alertas_activas.criticas, 0);
  console.log('  ✅ test_dashboard_sin_programacion');
}

async function test_programacion_carga_valida() {
  const res = await api('/api/v1/control-proyectos/programacion', {
    method: 'POST',
    body: JSON.stringify([{
      concepto_id: CONCEPTO_ID,
      concepto_clave: 'CIM-001',
      descripcion: 'Cimentación principal',
      fecha_inicio_plan: '2026-05-01',
      fecha_fin_plan: '2026-06-30',
      bac: 500000,
      curva_programada: CURVA_VALIDA,
    }]),
  });
  const body = (await res.json()) as any;
  assert.equal(res.status, 201, `Esperado 201, got ${res.status}: ${JSON.stringify(body)}`);
  assert.equal(body.data.total, 1);
  console.log('  ✅ test_programacion_carga_valida');
}

async function test_programacion_curva_sin_100_rechaza() {
  const res = await api('/api/v1/control-proyectos/programacion', {
    method: 'POST',
    body: JSON.stringify([{
      concepto_id: randomUUID(),
      concepto_clave: 'EST-001',
      descripcion: 'Estructura',
      fecha_inicio_plan: '2026-05-01',
      fecha_fin_plan: '2026-07-31',
      bac: 300000,
      curva_programada: [
        { semana: '2026-W20', pct_acumulado: 20 },
        { semana: '2026-W21', pct_acumulado: 90 }, // No llega a 100
      ],
    }]),
  });
  assert.equal(res.status, 422);
  const body = (await res.json()) as any;
  assert.ok(body.error?.message?.includes('100%'), `Expected 100% message, got: ${body.error?.message}`);
  console.log('  ✅ test_programacion_curva_sin_100_rechaza');
}

async function test_curva_s_sin_programacion() {
  // Usar TENANT/PROYECTO distintos sin datos
  const otroTenant = randomUUID();
  const otroProy = randomUUID();
  const { default: fetch } = await import('node-fetch');
  const tk = signTenantToken({ userId: USER_ID, tenantId: otroTenant, proyectoId: otroProy, roles: ['admin'] });
  const res = await fetch(`${baseUrl}/api/v1/control-proyectos/curva-s`, {
    headers: { Authorization: `Bearer ${tk}` },
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.data.error, 'SIN_PROGRAMACION');
  console.log('  ✅ test_curva_s_sin_programacion');
}

async function test_alerta_reconocer() {
  // Crear alerta directamente en DB
  const alerta = await createTenantContext({ tenantId: TENANT_ID, proyectoId: PROYECTO_ID, userId: USER_ID }, async (tx) =>
    tx.alertaProyecto.create({
      data: {
        tenant_id: TENANT_ID,
        proyecto_id: PROYECTO_ID,
        tipo: 'PARTIDA_BLOQUEADA',
        severidad: 'CRITICA',
        titulo: 'Test alerta bloqueada',
        descripcion: 'Partida TEST bloqueada por exceso de comprometido',
        datos: { concepto_clave: 'TEST-001' },
        estado: 'ACTIVA',
      },
    })
  );

  const res = await api(`/api/v1/control-proyectos/alertas/${alerta.id}/reconocer`, {
    method: 'PATCH',
    body: JSON.stringify({ nota_cp: 'Coordinado con Compras para desbloquearse en 3 días' }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.data.estado, 'RECONOCIDA');
  assert.ok(body.data.nota_cp?.length > 0);
  console.log('  ✅ test_alerta_reconocer');
}

async function test_evm_retorna_por_partida() {
  const res = await api('/api/v1/control-proyectos/evm');
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.por_partida));
  // Debería tener la partida cargada en test_programacion_carga_valida
  assert.ok(body.data.por_partida.some((p: any) => p.concepto_clave === 'CIM-001'));
  console.log('  ✅ test_evm_retorna_por_partida');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

const TESTS = [
  test_dashboard_sin_programacion,
  test_programacion_carga_valida,
  test_programacion_curva_sin_100_rechaza,
  test_curva_s_sin_programacion,
  test_alerta_reconocer,
  test_evm_retorna_por_partida,
];

(async () => {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Integration Tests: Control de Proyectos');
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
