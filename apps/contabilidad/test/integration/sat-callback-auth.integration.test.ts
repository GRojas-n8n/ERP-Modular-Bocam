/**
 * Tests de Integración: autenticación del callback de integración SAT
 * Spec: openspec/changes/fix-auth-callbacks-sat-contabilidad/
 *
 * Los 3 endpoints /integraciones/sat/{claim-dispatch,callback,failure-callback}
 * están exentos de JWT (su llamador legítimo es el worker de contabilidad, no
 * una sesión de usuario) y se autenticaban solo con un secreto compartido
 * GLOBAL, tomando tenant_id/proyecto_id/id_conciliacion directo del body. Sin
 * verificar que el dispatch_id del body coincidiera con el generado
 * server-side para esa fila, cualquiera con el secreto (comprometido) podía
 * declarar cualquier tenant_id/id_conciliacion y forjar un callback válido.
 *
 * Este archivo reproduce esa fuga contra el endpoint HTTP real y confirma que
 * ahora se rechaza. NOTA: la conexión de prueba local usa el rol `postgres`
 * (superusuario) — RLS NO aplica aquí, estos tests validan exclusivamente el
 * candado a nivel de aplicación (assertDispatchOwnership), que es justamente
 * el punto: la protección no puede depender solo de RLS para este caso,
 * porque RLS no distingue "tenant_id correcto pero dispatch_id ajeno".
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';
process.env.SAT_CALLBACK_SHARED_SECRET = process.env.SAT_CALLBACK_SHARED_SECRET || 'test-sat-callback-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl = process.env.DATABASE_URL?.replace('schema=finanzas', 'schema=contabilidad')
  ?? 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let server: Server | undefined;
let baseUrl = '';
const SECRET = process.env.SAT_CALLBACK_SHARED_SECRET!;

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.conciliacionFiscal.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedConciliacionPendiente(overrides: { satDispatchId: string; satLastCompletedDispatchId?: string | null }) {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const asiento = await prisma.asientoContable.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      folio_poliza: `POL-TEST-${randomUUID().slice(0, 8)}`,
      concepto: 'Asiento de prueba SAT',
      monto_total: 1000,
      beneficiario: 'Proveedor de prueba',
    },
  });
  const conciliacion = await prisma.conciliacionFiscal.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      asiento_id: asiento.id_asiento,
      uuid_fiscal: randomUUID(),
      monto_pagado: 1000,
      estatus_sat: 'VALIDACION_EN_PROCESO',
      sat_dispatch_id: overrides.satDispatchId,
      sat_last_completed_dispatch_id: overrides.satLastCompletedDispatchId ?? null,
    },
  });
  return { tenantId, proyectoId, asientoId: asiento.id_asiento, conciliacion };
}

async function post(path: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json as any };
}

// ── Caso central: forja cross-tenant con dispatch_id inventado ─────────────

async function testCallbackRechazaDispatchIdInventado() {
  const realDispatchId = `sat-${randomUUID()}`;
  const seeded = await seedConciliacionPendiente({ satDispatchId: realDispatchId });

  try {
    const r = await post('/api/v1/contabilidad/integraciones/sat/callback', { 'x-bocam-secret': SECRET }, {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      dispatch_id: `sat-${randomUUID()}`, // inventado, no el guardado en la fila
      estatus_sat: 'VIGENTE',
    });

    assert.equal(
      r.status, 404,
      `Con el secreto correcto pero un dispatch_id inventado, el callback NO debe aplicar el cambio (status ${r.status}). ` +
      `Este es el ataque que asertDispatchOwnership cierra.`
    );

    const conciliacionTrasAtaque = await prisma.conciliacionFiscal.findUnique({ where: { id_conciliacion: seeded.conciliacion.id_conciliacion } });
    assert.equal(conciliacionTrasAtaque?.estatus_sat, 'VALIDACION_EN_PROCESO', 'el estatus_sat no debe haber cambiado');

    console.log('ok - callback SAT rechaza dispatch_id inventado (404), fila sin cambios');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function testCallbackAceptaDispatchIdCorrecto() {
  const realDispatchId = `sat-${randomUUID()}`;
  const seeded = await seedConciliacionPendiente({ satDispatchId: realDispatchId });

  try {
    const r = await post('/api/v1/contabilidad/integraciones/sat/callback', { 'x-bocam-secret': SECRET }, {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      dispatch_id: realDispatchId,
      estatus_sat: 'VIGENTE',
    });

    assert.equal(r.status, 200, 'con el dispatch_id correcto, el callback debe aplicarse normalmente');
    assert.equal(r.body?.data?.estatus_sat, 'VIGENTE');

    console.log('ok - callback SAT acepta dispatch_id correcto (200), no rompe el flujo legítimo');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function testCallbackAceptaDispatchIdYaCompletado() {
  const dispatchViejo = `sat-${randomUUID()}`;
  const dispatchNuevo = `sat-${randomUUID()}`;
  // Simula una entrega duplicada/tardía de un dispatch ya rotado hacia adelante.
  const seeded = await seedConciliacionPendiente({ satDispatchId: dispatchNuevo, satLastCompletedDispatchId: dispatchViejo });

  try {
    const r = await post('/api/v1/contabilidad/integraciones/sat/callback', { 'x-bocam-secret': SECRET }, {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      dispatch_id: dispatchViejo,
      estatus_sat: 'VIGENTE',
    });

    assert.equal(r.status, 200, 'un dispatch_id que coincide con sat_last_completed_dispatch_id debe aceptarse (reintento/duplicado legítimo)');

    console.log('ok - callback SAT acepta dispatch_id de sat_last_completed_dispatch_id (rama de reintento)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function testCallbackRechazaDispatchIdFaltante() {
  const seeded = await seedConciliacionPendiente({ satDispatchId: `sat-${randomUUID()}` });

  try {
    const r = await post('/api/v1/contabilidad/integraciones/sat/callback', { 'x-bocam-secret': SECRET }, {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      estatus_sat: 'VIGENTE',
      // dispatch_id omitido a propósito
    });

    assert.equal(r.status, 400, 'dispatch_id ausente en el body debe rechazarse con 400, no procesarse');

    console.log('ok - callback SAT rechaza payload sin dispatch_id (400)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function testCallbackRechazaSecretoIncorrectoOAusente() {
  const seeded = await seedConciliacionPendiente({ satDispatchId: `sat-${randomUUID()}` });

  try {
    const body = {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      dispatch_id: seeded.conciliacion.sat_dispatch_id,
      estatus_sat: 'VIGENTE',
    };

    const wrongSecret = await post('/api/v1/contabilidad/integraciones/sat/callback', { 'x-bocam-secret': 'secreto-incorrecto' }, body);
    assert.equal(wrongSecret.status, 401, 'secreto incorrecto debe responder 401');

    const noSecret = await post('/api/v1/contabilidad/integraciones/sat/callback', {}, body);
    assert.equal(noSecret.status, 401, 'ausencia del header debe responder 401');

    const conciliacionSinCambios = await prisma.conciliacionFiscal.findUnique({ where: { id_conciliacion: seeded.conciliacion.id_conciliacion } });
    assert.equal(conciliacionSinCambios?.estatus_sat, 'VALIDACION_EN_PROCESO', 'ninguna de las dos peticiones debe haber mutado la fila');

    console.log('ok - callback SAT rechaza secreto incorrecto/ausente (401), sin mutar datos');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── claim-dispatch ya NO regala el dispatch_id real ─────────────────────────

async function testClaimDispatchNoFiltraDispatchId() {
  const realDispatchId = `sat-${randomUUID()}`;
  const seeded = await seedConciliacionPendiente({ satDispatchId: realDispatchId });

  try {
    const r = await post('/api/v1/contabilidad/integraciones/sat/claim-dispatch', { 'x-bocam-secret': SECRET }, {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      dispatch_id: `sat-${randomUUID()}`, // deliberadamente incorrecto → claimed:false
      attempt: 1,
    });

    assert.equal(r.status, 200);
    assert.equal(r.body?.data?.claimed, false);

    const serialized = JSON.stringify(r.body);
    assert.ok(
      !serialized.includes(realDispatchId),
      'la respuesta de claim-dispatch NO debe contener el sat_dispatch_id real en ningún campo — ' +
      'antes de este fix se regalaba incluso en un claim rechazado, permitiendo cosechar el token'
    );
    assert.equal(r.body?.data?.sat_dispatch_id, undefined, 'el campo sat_dispatch_id ya no debe existir en la respuesta');

    console.log('ok - claim-dispatch ya no expone sat_dispatch_id en la respuesta (ni siquiera al rechazar)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── failure-callback con dispatch_id ajeno ──────────────────────────────────

async function testFailureCallbackRechazaDispatchIdInventado() {
  const realDispatchId = `sat-${randomUUID()}`;
  const seeded = await seedConciliacionPendiente({ satDispatchId: realDispatchId });

  try {
    const r = await post('/api/v1/contabilidad/integraciones/sat/failure-callback', { 'x-bocam-secret': SECRET }, {
      tenant_id: seeded.tenantId,
      proyecto_id: seeded.proyectoId,
      user_id: randomUUID(),
      id_conciliacion: seeded.conciliacion.id_conciliacion,
      dispatch_id: `sat-${randomUUID()}`,
      attempt: 1,
      max_attempts: 3,
      error_message: 'Error simulado de prueba',
    });

    assert.equal(r.status, 404, 'failure-callback con dispatch_id ajeno debe rechazarse');

    const conciliacionSinCambios = await prisma.conciliacionFiscal.findUnique({ where: { id_conciliacion: seeded.conciliacion.id_conciliacion } });
    assert.equal(conciliacionSinCambios?.sat_retry_count, 0, 'sat_retry_count no debe haber cambiado');
    assert.equal(conciliacionSinCambios?.sat_last_error, null, 'sat_last_error no debe haberse escrito');

    console.log('ok - failure-callback rechaza dispatch_id inventado (404), fila sin cambios');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCallbackRechazaDispatchIdInventado();
    await testCallbackAceptaDispatchIdCorrecto();
    await testCallbackAceptaDispatchIdYaCompletado();
    await testCallbackRechazaDispatchIdFaltante();
    await testCallbackRechazaSecretoIncorrectoOAusente();
    await testClaimDispatchNoFiltraDispatchId();
    await testFailureCallbackRechazaDispatchIdInventado();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - sat-callback-auth integration tests');
  console.error(error);
  process.exitCode = 1;
});
