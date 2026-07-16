/**
 * Tests de Integración: sincronización de PresupuestoAsignado por partida
 * desde el evento gerencia_tecnica.saldo_partida_creado.
 *
 * Ver openspec/changes/unificar-presupuesto-a-partidas-gt.
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/sincronizacion-partida-gt.integration.test.ts
 * Requiere: PostgreSQL + RabbitMQ reales.
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { createEventBus } from '../../../../packages/event-bus/src';
import {
  handleSaldoPartidaCreadoEvent,
  handlePartidaComprometidaEvent,
  handleOrdenCompraCreadaEvent,
  initEventBus,
  app,
} from '../../src/main';
import { createTenantContext } from '../../src/db';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function waitFor(assertion: () => Promise<void>, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try { await assertion(); return; } catch { await delay(250); }
  }
  await assertion();
}

async function cleanupTenantData(tenantId: string) {
  await createTenantContext({ tenantId, proyectoId: '00000000-0000-0000-0000-000000000000', userId: 'system' }, async (tx) => {
    await tx.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
  });
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const runId = randomUUID();
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const publisher = createEventBus(`gt-publisher-${runId}`);
  const consumer = createEventBus(`finanzas-it-${runId}`);

  let server: Server | undefined;
  let baseUrl = '';
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`ok - ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`not ok - ${name}`);
      console.error(err.message || err);
      failed++;
    }
  };

  try {
    await initEventBus();
    await publisher.connect();
    await consumer.connect();
    await consumer.subscribe('gerencia_tecnica.saldo_partida_creado', handleSaldoPartidaCreadoEvent);
    await consumer.subscribe('gerencia_tecnica.partida_comprometida', handlePartidaComprometidaEvent);
    await consumer.subscribe('compras.oc_creada', handleOrdenCompraCreadaEvent);
    await delay(500);

    const started = await startHttpApp(app as any);
    server = started.server;
    baseUrl = started.baseUrl;

    const conceptoMaterialId = randomUUID();
    const conceptoSinApuId = randomUUID();
    const conceptoManoObraId = randomUUID();

    await test('sincroniza un PresupuestoAsignado por cada partida del evento, con capítulo mapeado', async () => {
      const published = await publisher.publish({
        event_type: 'gerencia_tecnica.saldo_partida_creado',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: {
          partidas: [
            { concepto_id: conceptoMaterialId, concepto_clave: 'MAT-001', concepto_desc: 'Cimentación', monto_aprobado: 480000, categoria_predominante: 'MATERIAL' },
            { concepto_id: conceptoSinApuId, concepto_clave: 'SIN-001', concepto_desc: 'Sin APU', monto_aprobado: 10000, categoria_predominante: null },
            { concepto_id: conceptoManoObraId, concepto_clave: 'MO-001', concepto_desc: 'Cuadrilla', monto_aprobado: 20000, categoria_predominante: 'MANO_DE_OBRA' },
          ],
        },
      });
      assert.equal(published, true, 'el evento debe publicarse');

      await waitFor(async () => {
        const p1 = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoMaterialId } }));
        assert.ok(p1, 'debe existir el presupuesto sincronizado para la partida MATERIAL');
        assert.equal(p1!.capitulo, 'MATERIALES');
        assert.equal(Number(p1!.monto_autorizado), 480000);
        assert.equal(Number(p1!.monto_disponible), 480000);
        assert.equal(p1!.concepto_clave, 'MAT-001');
        assert.equal(p1!.estatus, 'ACTIVO');

        const p2 = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoSinApuId } }));
        assert.ok(p2, 'debe existir el presupuesto de la partida sin APU');
        assert.equal(p2!.capitulo, 'INDIRECTOS', 'categoria_predominante null cae en INDIRECTOS por default');

        const p3 = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoManoObraId } }));
        assert.ok(p3, 'debe existir el presupuesto de la partida MANO_DE_OBRA');
        assert.equal(p3!.capitulo, 'MANO_OBRA', 'MANO_DE_OBRA (GT) mapea a MANO_OBRA (Finanzas)');
      });
    });

    await test('sincroniza correctamente una partida con descripción larga (>500 caracteres, caso real de producción)', async () => {
      const conceptoDescLargaId = randomUUID();
      const descLarga = 'DEMOLICION DE CONCRETO REFORZADO. '.repeat(30); // > 500 chars, como conceptos reales de GT
      assert.ok(descLarga.length > 500, 'la descripción de prueba debe superar 500 caracteres');

      const published = await publisher.publish({
        event_type: 'gerencia_tecnica.saldo_partida_creado',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: {
          partidas: [
            { concepto_id: conceptoDescLargaId, concepto_clave: 'LARGA-001', concepto_desc: descLarga, monto_aprobado: 1000, categoria_predominante: 'MATERIAL' },
          ],
        },
      });
      assert.equal(published, true);

      await waitFor(async () => {
        const p = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoDescLargaId } }));
        assert.ok(p, 'debe sincronizar sin fallar aunque la descripción supere 500 caracteres');
        assert.equal(p!.descripcion, descLarga, 'la descripción completa debe persistirse sin truncar');
      });
    });

    await test('reenviar el mismo evento actualiza (no duplica) el presupuesto sincronizado', async () => {
      const republished = await publisher.publish({
        event_type: 'gerencia_tecnica.saldo_partida_creado',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: {
          partidas: [
            { concepto_id: conceptoMaterialId, concepto_clave: 'MAT-001', concepto_desc: 'Cimentación', monto_aprobado: 500000, categoria_predominante: 'MATERIAL' },
          ],
        },
      });
      assert.equal(republished, true);

      await waitFor(async () => {
        const count = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.count({ where: { concepto_id: conceptoMaterialId } }));
        assert.equal(count, 1, 'no debe duplicarse — sigue siendo 1 fila para esa partida');

        const p1 = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoMaterialId } }));
        assert.equal(Number(p1!.monto_autorizado), 500000, 'monto_autorizado debe reflejar la última sincronización');
      });
    });

    await test('GET /presupuestos/por-concepto/:conceptoId retorna el presupuesto sincronizado', async () => {
      const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['finanzas'] });
      const res = await fetch(`${baseUrl}/api/v1/finanzas/presupuestos/por-concepto/${conceptoMaterialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json() as any;
      assert.equal(body.data.concepto_id, conceptoMaterialId);
    });

    await test('GET /presupuestos/por-concepto/:conceptoId retorna 404 si no hay presupuesto sincronizado', async () => {
      const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['finanzas'] });
      const res = await fetch(`${baseUrl}/api/v1/finanzas/presupuestos/por-concepto/${randomUUID()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.equal(res.status, 404);
    });

    await test('POST /presupuestos rechaza capitulo distinto de MANO_OBRA (422)', async () => {
      const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['finanzas'], limiteAprobacion: 999999999 });
      const res = await fetch(`${baseUrl}/api/v1/finanzas/presupuestos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: `PRES-MAT-${Date.now()}`, descripcion: 'Intento manual', monto_autorizado: 1000, capitulo: 'MATERIALES' }),
      });
      assert.equal(res.status, 422);
    });

    await test('POST /presupuestos sigue permitiendo capitulo MANO_OBRA', async () => {
      const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['finanzas'], limiteAprobacion: 999999999 });
      const res = await fetch(`${baseUrl}/api/v1/finanzas/presupuestos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: `PRES-MO-${Date.now()}`, descripcion: 'Mano de obra del proyecto', monto_autorizado: 200000, capitulo: 'MANO_OBRA' }),
      });
      assert.equal(res.status, 201);
    });

    await test('gerencia_tecnica.partida_comprometida incrementa monto_comprometido del presupuesto sincronizado', async () => {
      const ocId = randomUUID();
      const published = await publisher.publish({
        event_type: 'gerencia_tecnica.partida_comprometida',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: {
          concepto_id: conceptoMaterialId, monto: 60000, referencia_id: ocId,
          referencia_codigo: 'OC-COMP-001', tipo: 'OC', monto_comprometido: 60000, monto_disponible: 440000,
        },
      });
      assert.equal(published, true);

      await waitFor(async () => {
        const p = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoMaterialId } }));
        assert.equal(Number(p!.monto_comprometido), 60000);
        assert.equal(Number(p!.monto_disponible), 440000);

        const mov = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
          tx.movimientoPresupuestal.findFirst({ where: { referencia_modulo: 'compras', referencia_entidad: 'OrdenCompra', referencia_id: ocId, tipo: 'COMPROMISO' } }));
        assert.ok(mov, 'debe crear un MovimientoPresupuestal con la misma clave de idempotencia que usa el flujo de compras.oc_creada');
      });
    });

    await test('interopera con compras.oc_creada sin duplicar el compromiso (misma clave de idempotencia)', async () => {
      const ocId = randomUUID();
      // Simula que compras.oc_creada llega PRIMERO (camino existente) — crea el
      // movimiento real. El evento nuevo de GT debe ver el registro existente y
      // no duplicar el compromiso.
      const presupuesto = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
        tx.presupuestoAsignado.findFirst({ where: { concepto_id: conceptoMaterialId } }));

      await handleOrdenCompraCreadaEvent({
        event_type: 'compras.oc_creada',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: { oc_id: ocId, codigo: 'OC-INTEROP-001', total: 15000, presupuesto_id: presupuesto!.id_presupuesto },
      } as any);

      const antes = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
        tx.presupuestoAsignado.findUnique({ where: { id_presupuesto: presupuesto!.id_presupuesto } }));

      await publisher.publish({
        event_type: 'gerencia_tecnica.partida_comprometida',
        timestamp: new Date().toISOString(),
        context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
        payload: {
          concepto_id: conceptoMaterialId, monto: 15000, referencia_id: ocId,
          referencia_codigo: 'OC-INTEROP-001', tipo: 'OC', monto_comprometido: 15000, monto_disponible: 0,
        },
      });
      await delay(1500);

      const despues = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
        tx.presupuestoAsignado.findUnique({ where: { id_presupuesto: presupuesto!.id_presupuesto } }));
      assert.equal(Number(despues!.monto_comprometido), Number(antes!.monto_comprometido), 'el evento de GT no debe duplicar el compromiso ya aplicado por compras.oc_creada');

      const count = await createTenantContext({ tenantId, proyectoId, userId }, (tx) =>
        tx.movimientoPresupuestal.count({ where: { referencia_entidad: 'OrdenCompra', referencia_id: ocId, tipo: 'COMPROMISO' } }));
      assert.equal(count, 1, 'solo debe existir 1 movimiento para esa OC, sin importar cuántos caminos la reporten');
    });

    console.log(`\n${passed + failed} tests | ${passed} passed | ${failed} failed`);
  } finally {
    await cleanupTenantData(tenantId);
    await consumer.close();
    await publisher.close();
    await stopHttpApp(server);
  }

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('not ok - sincronizacion-partida-gt');
  console.error(err);
  process.exitCode = 1;
});
