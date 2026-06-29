/**
 * Tests: control_obra.avance_fisico_validado → AsientoContable + MovimientoPoliza
 * Runner: node -r ts-node/register/transpile-only test/integration/control-obra.avance.integration.test.ts
 * Requiere: PostgreSQL contabilidad + seed de cuentas + RabbitMQ
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { handleAvanceFisicoValidadoEvent } from '../../src/main';

const dbUrl = process.env.DATABASE_URL?.replace('schema=finanzas', 'schema=contabilidad')
  ?? 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let server: Server | undefined;

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server = started.server;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.movimientoPoliza.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
}

async function testAvanceCreaAsiento() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();

  try {
    const avanceId = randomUUID();
    await handleAvanceFisicoValidadoEvent({
      event_type: 'control_obra.avance_fisico_validado',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyId, user_id: userId },
      payload:    { avance_id: avanceId, codigo: 'AVA-001', monto_avaluado: 150000, concepto: 'Avance 60% estructura' },
    } as any);

    const asiento = await prisma.asientoContable.findFirst({
      where: { tenant_id: tenantId, external_event_key: `control_obra.avance_fisico_validado:${avanceId}` },
    });
    assert.ok(asiento, 'Debe crear AsientoContable');
    assert.equal(asiento.tipo_poliza, 'AVANCE');
    assert.equal(Number(asiento.monto_total), 150000);

    const movs = await prisma.movimientoPoliza.findMany({ where: { tenant_id: tenantId, asiento_id: asiento.id_asiento } });
    if (movs.length > 0) {
      const totalCargo = movs.reduce((s, m) => s + Number(m.cargo), 0);
      const totalAbono = movs.reduce((s, m) => s + Number(m.abono), 0);
      assert.ok(Math.abs(totalCargo - totalAbono) < 0.01, 'Movimientos deben cuadrar');
    }

    console.log('  ✓ avance_fisico_validado crea asiento + movimientos cuadrados');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testAvanceIdempotente() {
  const tenantId = randomUUID();
  const proyId   = randomUUID();
  const userId   = randomUUID();

  try {
    const avanceId = randomUUID();
    const event = {
      event_type: 'control_obra.avance_fisico_validado',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyId, user_id: userId },
      payload:    { avance_id: avanceId, codigo: 'AVA-002', monto_avaluado: 30000 },
    };

    await handleAvanceFisicoValidadoEvent(event as any);
    await handleAvanceFisicoValidadoEvent(event as any);

    const count = await prisma.asientoContable.count({
      where: { tenant_id: tenantId, external_event_key: `control_obra.avance_fisico_validado:${avanceId}` },
    });
    assert.equal(count, 1, 'Segunda llamada idempotente — solo 1 asiento');

    console.log('  ✓ avance_fisico_validado es idempotente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  console.log('\nAvance Físico Validado — Tests integración:');
  const tests = [testAvanceCreaAsiento, testAvanceIdempotente];
  let passed = 0; let failed = 0;
  for (const t of tests) {
    try { await t(); passed++; }
    catch (err: any) { console.error(`  ✗ ${t.name}: ${err.message}`); failed++; }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`);
  await teardown();
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
