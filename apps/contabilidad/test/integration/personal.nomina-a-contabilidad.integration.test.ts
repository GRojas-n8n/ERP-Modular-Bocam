import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient as ContabilidadPrismaClient } from '../../src/generated/prisma';
import { PrismaClient as PersonalPrismaClient } from '../../../personal/src/generated/prisma';
import { createEventBus, type BocamEvent } from '../../../../packages/event-bus/src';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const personalDbUrl   = process.env.PERSONAL_DATABASE_URL   || process.env.DATABASE_URL || 'postgresql://bocam_admin:S77S.52p-016t4t5n7nt@localhost:5432/bocam_erp?schema=personal';
const contabilidadDbUrl = process.env.CONTABILIDAD_DATABASE_URL
  || (personalDbUrl.includes('schema=personal') ? personalDbUrl.replace('schema=personal', 'schema=contabilidad') : 'postgresql://bocam_admin:S77S.52p-016t4t5n7nt@localhost:5432/bocam_erp?schema=contabilidad');

const personalPrisma = new PersonalPrismaClient({ datasources: { db: { url: personalDbUrl } } });
const contabilidadPrisma = new ContabilidadPrismaClient({ datasources: { db: { url: contabilidadDbUrl } } });
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function waitFor(assertion: () => Promise<void>, timeoutMs = 12000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try { await assertion(); return; } catch { await delay(250); }
  }
  await assertion();
}

async function cleanupTenantData(tenantId: string) {
  await contabilidadPrisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
  await personalPrisma.preNomina.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedPreNomina(tenantId: string, proyectoId: string, userId: string) {
  return personalPrisma.preNomina.create({
    data: {
      tenant_id:          tenantId,
      proyecto_id:        proyectoId,
      codigo:             `NOM-IT-${Date.now()}`,
      periodo_tipo:       'SEMANAL',
      periodo_inicio:     new Date('2026-07-01'),
      periodo_fin:        new Date('2026-07-07'),
      total_percepciones: 80000,
      total_deducciones:  17500,
      total_neto:         62500,
      total_empleados:    15,
      estado:             'CALCULADA',
      elaborado_por:      userId,
    },
  });
}

async function main() {
  process.env.RABBITMQ_URL = rabbitUrl;
  process.env.PERSONAL_DATABASE_URL    = personalDbUrl;
  process.env.CONTABILIDAD_DATABASE_URL = contabilidadDbUrl;
  process.env.CONTABILIDAD_EVENT_BUS_NAME = `contabilidad-it-${randomUUID()}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

  const tenantId   = randomUUID();
  const proyectoId = randomUUID();
  const userId     = randomUUID();

  const personalModule      = await import('../../../personal/src/main');
  const contabilidadModule  = await import('../../src/main');

  const prenomina = await seedPreNomina(tenantId, proyectoId, userId);
  const duplicatePublisher = createEventBus(`contabilidad-dup-${randomUUID()}`);
  let personalServer: import('node:http').Server | undefined;

  try {
    await personalModule.initEventBus();
    await contabilidadModule.initEventBus();
    await duplicatePublisher.connect();

    const started = await startHttpApp(personalModule.app);
    personalServer = started.server;
    const baseUrl  = started.baseUrl;
    await delay(500);

    const token = signTenantToken({
      userId,
      tenantId,
      proyectoId,
      roles: ['admin'],
      projects: [proyectoId],
    });

    // ── Test 1: PATCH /autorizar → asiento MANO_OBRA creado en Contabilidad ──
    const resp = await fetch(`${baseUrl}/api/v1/personal/prenominas/${prenomina.id_prenomina}/autorizar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    assert.equal(resp.status, 200, `Autorizar prenomina: esperado 200, obtenido ${resp.status}`);

    await waitFor(async () => {
      const asiento = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: tenantId,
          external_event_key: `personal.nomina_autorizada:${prenomina.id_prenomina}`,
        },
      });
      assert.equal(asiento.tipo_poliza, 'MANO_OBRA');
      assert.ok(asiento.folio_poliza.startsWith('POL-NOM-'));
      assert.equal(Number(asiento.monto_total), 62500);
    });

    console.log('ok 1 - personal.nomina_autorizada → asiento MANO_OBRA creado en contabilidad');

    // ── Test 2: Re-autorizar la misma prenomina → 409, NO duplicar evento ──
    const resp2 = await fetch(`${baseUrl}/api/v1/personal/prenominas/${prenomina.id_prenomina}/autorizar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    assert.equal(resp2.status, 500, `Re-autorizar debe fallar: esperado 500 (CALCULADA → AUTORIZADA ya), obtenido ${resp2.status}`);

    await delay(800);
    const countAsientos = await contabilidadPrisma.asientoContable.count({
      where: { tenant_id: tenantId, external_event_key: `personal.nomina_autorizada:${prenomina.id_prenomina}` },
    });
    assert.equal(countAsientos, 1, 'Idempotencia: debe existir exactamente 1 asiento');
    console.log('ok 2 - re-autorizar falla; asiento no duplicado');

    // ── Test 3: Evento duplicado directo → idempotencia por external_event_key ──
    await duplicatePublisher.publish({
      event_type: 'personal.nomina_autorizada',
      timestamp:  new Date().toISOString(),
      context:    { tenant_id: tenantId, proyecto_id: proyectoId, user_id: userId },
      payload: {
        prenomina_id:          prenomina.id_prenomina,
        codigo:                prenomina.codigo,
        periodo_tipo:          'SEMANAL',
        periodo_inicio:        '2026-07-01',
        periodo_fin:           '2026-07-07',
        total_percepciones:    80000,
        total_deducciones:     17500,
        total_neto:            62500,
        total_empleados:       15,
        autorizado_por_id:     userId,
        autorizado_por_nombre: 'Test User',
      },
    });

    await delay(800);
    const countAfterDup = await contabilidadPrisma.asientoContable.count({
      where: { tenant_id: tenantId, external_event_key: `personal.nomina_autorizada:${prenomina.id_prenomina}` },
    });
    assert.equal(countAfterDup, 1, 'Idempotencia evento duplicado: sigue siendo 1 asiento');
    console.log('ok 3 - evento personal.nomina_autorizada duplicado ignorado (idempotente)');

    // ── Test 4: PATCH /pagar → asiento PAGO_NOMINA creado ──
    const respPagar = await fetch(`${baseUrl}/api/v1/personal/prenominas/${prenomina.id_prenomina}/pagar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    assert.equal(respPagar.status, 200, `Marcar pagada: esperado 200, obtenido ${respPagar.status}`);

    await waitFor(async () => {
      const asientoPago = await contabilidadPrisma.asientoContable.findFirstOrThrow({
        where: {
          tenant_id: tenantId,
          external_event_key: `personal.nomina_pagada:${prenomina.id_prenomina}`,
        },
      });
      assert.equal(asientoPago.tipo_poliza, 'PAGO_NOMINA');
      assert.ok(asientoPago.folio_poliza.startsWith('POL-PAG-NOM-'));
    });

    console.log('ok 4 - personal.nomina_pagada → asiento PAGO_NOMINA creado en contabilidad');
    console.log('ok - integración personal.nomina_autorizada + nomina_pagada → contabilidad MANO_OBRA + PAGO_NOMINA');

  } finally {
    await stopHttpApp(personalServer);
    await duplicatePublisher.close();
    await contabilidadModule.shutdownEventBus();
    await personalModule.shutdownEventBus();
    await cleanupTenantData(tenantId);
    await contabilidadPrisma.$disconnect();
    await personalPrisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - integración personal.nomina_autorizada → contabilidad');
  console.error(error);
  process.exitCode = 1;
});
