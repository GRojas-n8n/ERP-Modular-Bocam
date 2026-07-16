/**
 * Tests de Integración: evento gerencia_tecnica.partida_comprometida
 *
 * Verifica que POST /partidas/:concepto_id/comprometer publica el evento
 * que Finanzas consumirá para sincronizar el monto_comprometido de su
 * espejo de presupuesto por partida (ver
 * openspec/changes/unificar-presupuesto-a-partidas-gt, sección 3/4).
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/partida-comprometida-evento.integration.test.ts
 * Requiere: PostgreSQL + RabbitMQ reales.
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

interface PartidaComprometidaPayload {
  concepto_id: string;
  monto: number;
  referencia_id: string;
  referencia_codigo?: string;
  tipo: string;
  monto_comprometido: number;
  monto_disponible: number;
}

async function main() {
  process.env.RABBITMQ_URL = RABBIT_URL;

  const gtModule = await import('../../src/main');
  const probe = createEventBus(`gt-comprometer-probe-${randomUUID()}`);
  const received: BocamEvent<PartidaComprometidaPayload>[] = [];

  let server: Server | undefined;
  let baseUrl = '';
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try { await fn(); console.log(`ok - ${name}`); passed++; }
    catch (err: any) { console.error(`not ok - ${name}`); console.error(err.message || err); failed++; }
  };

  try {
    await initEventBus();
    await probe.connect();
    await probe.subscribe('gerencia_tecnica.partida_comprometida', async (event: BocamEvent<PartidaComprometidaPayload>) => {
      received.push(event);
    });

    const started = await startHttpApp(gtModule.app as any);
    server = started.server;
    baseUrl = started.baseUrl;
    await delay(500);

    const token = signTenantToken({ userId: USER_ID, tenantId: TENANT_ID, proyectoId: PROYECTO_ID, roles: ['admin'] });
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-tenant-id': TENANT_ID,
      'x-proyecto-id': PROYECTO_ID,
    };

    const presupuesto = await prisma.presupuestoBase.create({
      data: { id: randomUUID(), tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, estado: 'BORRADOR', importe_total: 0 },
    });
    const conceptoId = randomUUID();
    await prisma.concepto.create({
      data: {
        id: conceptoId, tenant_id: TENANT_ID, proyecto_id: PROYECTO_ID, presupuesto_id: presupuesto.id,
        clave: 'CMP-001', descripcion: 'Concepto comprometer', unidad_medida: 'M2',
        cantidad: 1, precio_unitario: 100000, importe: 100000,
      },
    });
    await fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuestos/${presupuesto.id}/aprobar`, { method: 'PATCH', headers });

    const ocId = randomUUID();

    await test('comprometer publica gerencia_tecnica.partida_comprometida con el payload correcto', async () => {
      const res = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/partidas/${conceptoId}/comprometer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ monto: 40000, referencia_id: ocId, referencia_codigo: 'OC-EVT-001', tipo: 'OC' }),
      });
      assert.equal(res.status, 200);

      await waitFor(() => {
        const found = received.find((e) => e.payload.referencia_id === ocId);
        assert.ok(found, 'debe haberse publicado gerencia_tecnica.partida_comprometida');
        assert.equal(found!.payload.concepto_id, conceptoId);
        assert.equal(found!.payload.monto, 40000);
        assert.equal(found!.payload.tipo, 'OC');
        assert.equal(found!.payload.referencia_codigo, 'OC-EVT-001');
      });
    });

    await test('reintento idempotente NO vuelve a publicar el evento', async () => {
      const countBefore = received.length;
      const res = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/partidas/${conceptoId}/comprometer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ monto: 40000, referencia_id: ocId, referencia_codigo: 'OC-EVT-001', tipo: 'OC' }),
      });
      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.data.idempotente, true);
      await delay(1000);
      assert.equal(received.length, countBefore, 'no debe publicarse un evento nuevo en el reintento idempotente');
    });

    console.log(`\n${passed + failed} tests | ${passed} passed | ${failed} failed`);
  } finally {
    await prisma.saldoMovimiento.deleteMany({ where: { tenant_id: TENANT_ID } });
    await prisma.saldoPartida.deleteMany({ where: { tenant_id: TENANT_ID } });
    await prisma.concepto.deleteMany({ where: { tenant_id: TENANT_ID } });
    await prisma.presupuestoBase.deleteMany({ where: { tenant_id: TENANT_ID } });
    await probe.close();
    await stopHttpApp(server);
    await prisma.$disconnect();
  }

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('not ok - partida-comprometida-evento');
  console.error(err);
  process.exitCode = 1;
});
