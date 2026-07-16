/**
 * Tests de Integración: nómina compromete/ejerce el presupuesto de Mano de Obra
 * a nivel proyecto (capacidad presupuesto-mano-obra-proyecto).
 *
 * Ver openspec/changes/unificar-presupuesto-a-partidas-gt.
 *
 * Runner: node -r ts-node/register/transpile-only test/integration/nomina-presupuesto-mano-obra.integration.test.ts
 * Requiere: PostgreSQL + RabbitMQ reales.
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createEventBus } from '../../../../packages/event-bus/src';
import {
  handleNominaAutorizadaEvent,
  handleNominaPagadaEvent,
  initEventBus,
} from '../../src/main';
import { createTenantContext } from '../../src/db';

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function waitFor(assertion: () => Promise<void>, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try { await assertion(); return; } catch { await delay(250); }
  }
  await assertion();
}

async function seedPresupuestoManoObra(tenantId: string, proyectoId: string) {
  return createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
    tx.presupuestoAsignado.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        codigo: `PRES-MO-${Date.now()}`,
        descripcion: 'Mano de obra del proyecto',
        monto_autorizado: 500000,
        monto_disponible: 500000,
        capitulo: 'MANO_OBRA',
        estatus: 'ACTIVO',
      },
    }));
}

async function cleanup(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'system' }, async (tx) => {
    await tx.movimientoPresupuestal.deleteMany({ where: { tenant_id: tenantId } });
    await tx.presupuestoAsignado.deleteMany({ where: { tenant_id: tenantId } });
  });
}

function nominaPayload(prenominaId: string) {
  return {
    prenomina_id: prenominaId,
    codigo: 'NOM-2026-S22',
    periodo_tipo: 'SEMANAL',
    periodo_inicio: '2026-07-06',
    periodo_fin: '2026-07-12',
    total_percepciones: 180000,
    total_deducciones: 30000,
    total_neto: 150000,
    total_empleados: 45,
    autorizado_por_id: randomUUID(),
    autorizado_por_nombre: 'Super Test',
  };
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  const runId = randomUUID();
  const publisher = createEventBus(`personal-publisher-${runId}`);
  const consumer = createEventBus(`finanzas-it-${runId}`);
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try { await fn(); console.log(`ok - ${name}`); passed++; }
    catch (err: any) { console.error(`not ok - ${name}`); console.error(err.message || err); failed++; }
  };

  try {
    await initEventBus();
    await publisher.connect();
    await consumer.connect();
    await consumer.subscribe('personal.nomina_autorizada', handleNominaAutorizadaEvent);
    await consumer.subscribe('personal.nomina_pagada', handleNominaPagadaEvent);
    await delay(500);

    await test('autorizar nómina compromete el presupuesto de Mano de Obra del proyecto', async () => {
      const tenantId = randomUUID();
      const proyectoId = randomUUID();
      const presupuesto = await seedPresupuestoManoObra(tenantId, proyectoId);
      const prenominaId = randomUUID();

      try {
        await publisher.publish({
          event_type: 'personal.nomina_autorizada',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
          payload: nominaPayload(prenominaId),
        });

        await waitFor(async () => {
          const p = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
            tx.presupuestoAsignado.findUnique({ where: { id_presupuesto: presupuesto.id_presupuesto } }));
          assert.equal(Number(p!.monto_comprometido), 150000);
          assert.equal(Number(p!.monto_disponible), 350000);

          const mov = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
            tx.movimientoPresupuestal.findFirst({ where: { referencia_entidad: 'PreNomina', referencia_id: prenominaId, tipo: 'COMPROMISO' } }));
          assert.ok(mov, 'debe crear MovimientoPresupuestal COMPROMISO');
          assert.equal(Number(mov!.monto), 150000);
        });
      } finally {
        await cleanup(tenantId, proyectoId);
      }
    });

    await test('pagar nómina ejerce el compromiso (comprometido -> ejercido)', async () => {
      const tenantId = randomUUID();
      const proyectoId = randomUUID();
      const presupuesto = await seedPresupuestoManoObra(tenantId, proyectoId);
      const prenominaId = randomUUID();

      try {
        await publisher.publish({
          event_type: 'personal.nomina_autorizada',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
          payload: nominaPayload(prenominaId),
        });
        await waitFor(async () => {
          const mov = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
            tx.movimientoPresupuestal.findFirst({ where: { referencia_entidad: 'PreNomina', referencia_id: prenominaId, tipo: 'COMPROMISO' } }));
          assert.ok(mov);
        });

        await publisher.publish({
          event_type: 'personal.nomina_pagada',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
          payload: nominaPayload(prenominaId),
        });

        await waitFor(async () => {
          const p = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
            tx.presupuestoAsignado.findUnique({ where: { id_presupuesto: presupuesto.id_presupuesto } }));
          assert.equal(Number(p!.monto_comprometido), 0, 'comprometido debe volver a 0');
          assert.equal(Number(p!.monto_ejercido), 150000, 'ejercido debe reflejar el pago');

          const mov = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
            tx.movimientoPresupuestal.findFirst({ where: { referencia_entidad: 'PreNomina', referencia_id: prenominaId, tipo: 'EJERCIDO' } }));
          assert.ok(mov, 'debe crear MovimientoPresupuestal EJERCIDO');
        });
      } finally {
        await cleanup(tenantId, proyectoId);
      }
    });

    await test('evento duplicado no duplica el MovimientoPresupuestal', async () => {
      const tenantId = randomUUID();
      const proyectoId = randomUUID();
      await seedPresupuestoManoObra(tenantId, proyectoId);
      const prenominaId = randomUUID();

      try {
        await publisher.publish({
          event_type: 'personal.nomina_autorizada',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
          payload: nominaPayload(prenominaId),
        });
        await publisher.publish({
          event_type: 'personal.nomina_autorizada',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
          payload: nominaPayload(prenominaId),
        });

        await waitFor(async () => {
          const count = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
            tx.movimientoPresupuestal.count({ where: { referencia_entidad: 'PreNomina', referencia_id: prenominaId, tipo: 'COMPROMISO' } }));
          assert.equal(count, 1, 'no debe duplicarse el movimiento');
        });
      } finally {
        await cleanup(tenantId, proyectoId);
      }
    });

    await test('sin presupuesto de Mano de Obra activo, no falla y no crea movimiento', async () => {
      const tenantId = randomUUID();
      const proyectoId = randomUUID();
      const prenominaId = randomUUID();

      try {
        const published = await publisher.publish({
          event_type: 'personal.nomina_autorizada',
          timestamp: new Date().toISOString(),
          context: { tenant_id: tenantId, proyecto_id: proyectoId, user_id: randomUUID() },
          payload: nominaPayload(prenominaId),
        });
        assert.equal(published, true);
        await delay(1500);

        const count = await createTenantContext({ tenantId, proyectoId, userId: 'system' }, (tx) =>
          tx.movimientoPresupuestal.count({ where: { referencia_entidad: 'PreNomina', referencia_id: prenominaId } }));
        assert.equal(count, 0, 'sin presupuesto MANO_OBRA no debe crear ningún movimiento');
      } finally {
        await cleanup(tenantId, proyectoId);
      }
    });

    console.log(`\n${passed + failed} tests | ${passed} passed | ${failed} failed`);
  } finally {
    await consumer.close();
    await publisher.close();
  }

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('not ok - nomina-presupuesto-mano-obra');
  console.error(err);
  process.exitCode = 1;
});
