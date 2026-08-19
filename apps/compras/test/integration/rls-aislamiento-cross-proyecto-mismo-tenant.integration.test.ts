/**
 * Test de Integración: aislamiento estricto entre proyectos del mismo tenant
 * en Compras, tras el cambio de middleware (openspec:
 * aislamiento-proyecto-por-modulo, tarea 6.4).
 *
 * `requireProjectAccess()` ya no trata a `procurement` como rol de nivel
 * tenant — pero la barrera real contra fuga de datos entre proyectos del
 * mismo tenant siempre fue la RLS de `requisiciones` (Patrón Estricto, sin
 * cambios en este trabajo). Este test confirma que esa barrera sigue intacta
 * incluso manipulando el `id` directamente en la URL: un usuario `procurement`
 * con proyecto A activo y autorizado NO puede leer una requisición que
 * pertenece a un proyecto B del mismo tenant, aunque conozca su UUID exacto.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 *           apps/compras/prisma/rls-policies.sql ya aplicado.
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const started = await startHttpApp(comprasModule.app);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
}

async function get(pathUrl: string, token: string) {
  return fetch(`${baseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function testProcurementConProyectoAutorizadoNoLeeRequisicionDeOtroProyecto() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const solicitanteId = randomUUID();

  const requisicionB = await prisma.requisicion.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoB,
      codigo: `REQ-AISLAMIENTO-${Date.now()}`,
      solicitante_id: solicitanteId,
      solicitante_nombre: 'Residente de prueba',
    },
  });

  try {
    // procurement, con proyecto A activo Y autorizado explícitamente — ya NO
    // tiene bypass de nivel tenant tras este cambio (packages/auth-middleware).
    const token = signTenantToken({
      userId: randomUUID(),
      tenantId,
      proyectoId: proyectoA,
      roles: ['procurement'],
      projects: [proyectoA],
    });

    const r = await get(`/api/v1/compras/requisiciones/${requisicionB.id_requisicion}`, token);

    assert.equal(
      r.status, 404,
      'una requisición de otro proyecto del mismo tenant debe verse como no encontrada, aunque se conozca su UUID exacto'
    );

    console.log('ok - Compras: procurement con proyecto A activo no puede leer una requisición del proyecto B por URL manipulada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testProcurementConProyectoAutorizadoNoLeeRequisicionDeOtroProyecto();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-aislamiento-cross-proyecto-mismo-tenant integration tests');
  console.error(error);
  process.exitCode = 1;
});
