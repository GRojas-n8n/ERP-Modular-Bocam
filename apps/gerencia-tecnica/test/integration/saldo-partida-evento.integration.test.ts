/**
 * Tests de Integración: evento gerencia_tecnica.saldo_partida_creado
 *
 * Verifica que aprobar un PresupuestoBase publica el evento que Finanzas
 * consumirá para sincronizar su espejo de presupuesto por partida
 * (ver openspec/changes/unificar-presupuesto-a-partidas-gt).
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/saldo-partida-evento.integration.test.ts
 * Requiere: PostgreSQL + RabbitMQ reales (no usa el truco de RABBITMQ_URL inválido)
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { initEventBus } from '../../src/event-bus';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@127.0.0.1:5432/bocam_erp?schema=gerencia_tecnica';

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

const TENANT_ID   = randomUUID();
const PROYECTO_ID = randomUUID();
const USER_ID     = randomUUID();

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function waitFor(assertion: () => void, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { assertion(); return; } catch { await delay(200); }
  }
  assertion();
}

interface SaldoPartidaCreadoPayload {
  partidas: Array<{
    concepto_id: string;
    concepto_clave: string;
    concepto_desc: string;
    monto_aprobado: number;
    categoria_predominante: string | null;
  }>;
}

async function main() {
  process.env.RABBITMQ_URL = RABBIT_URL;

  const gtModule = await import('../../src/main');
  const probe = createEventBus(`gt-probe-${randomUUID()}`);
  const received: BocamEvent<SaldoPartidaCreadoPayload>[] = [];

  let server: Server | undefined;
  let baseUrl = '';

  try {
    await initEventBus();
    await probe.connect();
    await probe.subscribe('gerencia_tecnica.saldo_partida_creado', async (event: BocamEvent<SaldoPartidaCreadoPayload>) => {
      received.push(event);
    });

    const started = await startHttpApp(gtModule.app as any);
    server = started.server;
    baseUrl = started.baseUrl;
    await delay(500);

    const presupuesto = await prisma.presupuestoBase.create({
      data: { id: randomUUID(), tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, estado: 'BORRADOR', importe_total: 0 },
    });
    const conceptoId = randomUUID();
    await prisma.concepto.create({
      data: {
        id: conceptoId, tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, presupuesto_id: presupuesto.id,
        clave: 'EVT-001', descripcion: 'Concepto evento', unidad_medida: 'M2',
        cantidad: 3, precio_unitario: 500, importe: 1500,
      },
    });

    const token = signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles: ['admin'] });
    const res = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuestos/${presupuesto.id}/aprobar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
        'x-proyecto-id': PROYECTO_ID,
      },
    });
    assert.equal(res.status, 200, 'aprobar debe retornar 200');

    await waitFor(() => {
      const found = received.find((e) => e.context.proyecto_id === PROYECTO_ID);
      assert.ok(found, 'debe haberse publicado gerencia_tecnica.saldo_partida_creado para este proyecto');
      const partida = found!.payload.partidas.find((p) => p.concepto_id === conceptoId);
      assert.ok(partida, 'el payload debe incluir la partida aprobada');
      assert.equal(partida!.concepto_clave, 'EVT-001');
      assert.equal(partida!.monto_aprobado, 1500);
    });

    console.log('✓ Aprobar presupuesto publica gerencia_tecnica.saldo_partida_creado con el payload completo');
    console.log('\n1 tests | 1 passed | 0 failed');
  } finally {
    await prisma.saldoPartida.deleteMany({ where: { tenant_id: TENANT_ID } });
    await prisma.concepto.deleteMany({ where: { tenant_id: TENANT_ID } });
    await prisma.presupuestoBase.deleteMany({ where: { tenant_id: TENANT_ID } });
    await probe.close();
    await stopHttpApp(server);
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('not ok - saldo-partida-evento');
  console.error(err);
  process.exitCode = 1;
});
