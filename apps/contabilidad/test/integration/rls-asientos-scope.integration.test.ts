/**
 * Tests de Integración: GET /asientos debe acotarse a tenant + proyecto
 * Spec: openspec/changes/fix-rls-contabilidad-tablas-sin-cobertura/
 *
 * `GET /api/v1/contabilidad/asientos` hacía `findMany()` SIN ningún `where` —
 * cualquier usuario autenticado con rol admin/finanzas/superintendent de
 * CUALQUIER tenant leía el libro contable completo de TODOS los tenants, sin
 * necesitar conocer ningún ID. Este test reproduce el escenario contra el
 * endpoint HTTP real y confirma que ahora solo devuelve los asientos del
 * tenant+proyecto de la sesión.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 *           apps/contabilidad/prisma/rls-policies.sql ya aplicado.
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl = process.env.DATABASE_URL?.replace('schema=finanzas', 'schema=contabilidad')
  ?? 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=contabilidad';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const { app } = await import('../../src/main');
  const started = await startHttpApp(app as any);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.movimientoPoliza.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.conciliacionFiscal.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.conciliacionBancaria.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.asientoContable.deleteMany({ where: { tenant_id: tenantId } });
}

async function get(path: string, token: string) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json as any };
}

async function crearAsiento(tenantId: string, proyectoId: string, folio: string) {
  return prisma.asientoContable.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      folio_poliza: folio,
      concepto: `Asiento de prueba ${folio}`,
      monto_total: 1000,
      beneficiario: 'Proveedor de prueba',
    },
  });
}

async function testGetAsientosSoloDevuelveTenantYProyectoPropio() {
  const tenantA = randomUUID();
  const proyectoA = randomUUID();
  const proyectoOtroDeA = randomUUID(); // mismo tenant, otro proyecto
  const tenantB = randomUUID();
  const proyectoB = randomUUID();

  await crearAsiento(tenantA, proyectoA, 'POL-A-PROPIO');
  await crearAsiento(tenantA, proyectoOtroDeA, 'POL-A-OTRO-PROYECTO');
  await crearAsiento(tenantB, proyectoB, 'POL-B-OTRO-TENANT');

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: tenantA, proyectoId: proyectoA, roles: ['finanzas'] });
    const r = await get('/api/v1/contabilidad/asientos', token);

    assert.equal(r.status, 200);
    const folios = (r.body.data as any[]).map(a => a.folio_poliza);

    assert.ok(folios.includes('POL-A-PROPIO'), 'debe incluir el asiento propio del tenant/proyecto');
    assert.ok(
      !folios.includes('POL-A-OTRO-PROYECTO'),
      'NO debe incluir un asiento de otro proyecto del mismo tenant (fuga cross-proyecto)'
    );
    assert.ok(
      !folios.includes('POL-B-OTRO-TENANT'),
      'NO debe incluir un asiento de otro tenant (fuga cross-tenant — el bug original: findMany() sin where)'
    );

    console.log('ok - GET /asientos solo devuelve el tenant+proyecto de la sesión, no el libro contable completo');
  } finally {
    await cleanupTenant(tenantA);
    await cleanupTenant(tenantB);
  }
}

async function testGetAsientosSinProyectoActivoConsolidaTenant() {
  // openspec: aislamiento-proyecto-por-modulo, tarea 6.3 — asientos_contables
  // pasó a Patrón Global con Trazabilidad (tarea 1.2/4.2): registra el efecto
  // contable de pagos que ya son globales en Finanzas.
  const tenantA = randomUUID();
  const proyectoA = randomUUID();
  const proyectoOtroDeA = randomUUID();
  const tenantB = randomUUID();
  const proyectoB = randomUUID();

  await crearAsiento(tenantA, proyectoA, 'POL-GLOBAL-A1');
  await crearAsiento(tenantA, proyectoOtroDeA, 'POL-GLOBAL-A2');
  await crearAsiento(tenantB, proyectoB, 'POL-GLOBAL-B');

  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: tenantA, proyectoId: '', roles: ['finanzas'] });
    const r = await get('/api/v1/contabilidad/asientos', token);

    assert.equal(r.status, 200, 'sin proyecto activo, un rol finanzas debe recibir 200, no 500');
    const filas = r.body.data as any[];
    const folios = filas.map(a => a.folio_poliza);

    assert.ok(folios.includes('POL-GLOBAL-A1'), 'modo global debe incluir asientos del proyecto A');
    assert.ok(folios.includes('POL-GLOBAL-A2'), 'modo global debe incluir asientos del otro proyecto de A');
    assert.ok(!folios.includes('POL-GLOBAL-B'), 'modo global NUNCA debe cruzar tenants');

    const asientoA1 = filas.find(a => a.folio_poliza === 'POL-GLOBAL-A1');
    const asientoA2 = filas.find(a => a.folio_poliza === 'POL-GLOBAL-A2');
    assert.equal(asientoA1.proyecto_id, proyectoA, 'cada asiento conserva su proyecto_id de origen');
    assert.equal(asientoA2.proyecto_id, proyectoOtroDeA, 'cada asiento conserva su proyecto_id de origen');

    console.log('ok - GET /asientos sin proyecto activo consolida el tenant completo, trazable por fila');
  } finally {
    await cleanupTenant(tenantA);
    await cleanupTenant(tenantB);
  }
}

async function main() {
  await setup();
  try {
    await testGetAsientosSoloDevuelveTenantYProyectoPropio();
    await testGetAsientosSinProyectoActivoConsolidaTenant();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-asientos-scope integration tests');
  console.error(error);
  process.exitCode = 1;
});
