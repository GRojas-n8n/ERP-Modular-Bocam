/**
 * Test de Integración: aislamiento estricto entre proyectos del mismo tenant
 * en Control de Proyectos, tras el cambio de middleware compartido (openspec:
 * aislamiento-proyecto-por-modulo, tarea 6.4).
 *
 * Control de Proyectos nunca tuvo un rol con bypass de nivel tenant en
 * `requireProjectAccess()` (a diferencia de Compras con `procurement`), así
 * que este cambio no le afecta directamente en la capa de aplicación — pero
 * su RLS Patrón Estricto (10/10 tablas, ver design.md) es justo la barrera
 * que debe seguir intacta. Este test confirma que un usuario `residencia`
 * con proyecto A activo no puede leer una estimación de un proyecto B del
 * mismo tenant ni manipulando el `id` directamente en la URL.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 *           apps/control-proyectos/prisma/rls-policies.sql ya aplicado.
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';
import { createTenantContext } from '../../src/db';

const dbUrl = process.env.DATABASE_URL
  || 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=control_proyectos';

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

let server: Server | undefined;
let baseUrl = '';

async function setup() {
  const controlProyectosModule = await import('../../src/main');
  const started = await startHttpApp(controlProyectosModule.app);
  server  = started.server;
  baseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(server);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string, proyectoId: string) {
  await createTenantContext({ tenantId, proyectoId, userId: 'test-seed' }, (tx) =>
    tx.estimacion.deleteMany({ where: { tenant_id: tenantId } })
  );
}

async function get(pathUrl: string, token: string) {
  return fetch(`${baseUrl}${pathUrl}`, { headers: { Authorization: `Bearer ${token}` } });
}

async function testResidenciaConProyectoActivoNoLeeEstimacionDeOtroProyecto() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();
  const userId = randomUUID();

  const estimacionB = await createTenantContext(
    { tenantId, proyectoId: proyectoB, userId: 'test-seed' },
    (tx) => tx.estimacion.create({
      data: {
        tenant_id: tenantId,
        proyecto_id: proyectoB,
        numero_estimacion: Math.floor(Date.now() / 1000),
        codigo: `EST-AISLAMIENTO-${Date.now()}`,
        periodo_inicio: new Date('2026-03-01'),
        periodo_fin: new Date('2026-03-15'),
        subtotal: '10000.00',
        total_neto: '11600.00',
        iva: '1600.00',
        elaborado_por_id: userId,
        elaborado_por_nombre: 'Residente de prueba',
      },
    })
  );

  try {
    const token = signTenantToken({
      userId,
      tenantId,
      proyectoId: proyectoA,
      roles: ['residencia'],
      projects: [proyectoA],
    });

    const r = await get(`/api/v1/control-proyectos/estimaciones/${estimacionB.id_estimacion}`, token);

    assert.equal(
      r.status, 404,
      'una estimación de otro proyecto del mismo tenant debe verse como no encontrada, aunque se conozca su UUID exacto'
    );

    console.log('ok - Control de Proyectos: residencia con proyecto A activo no puede leer una estimación del proyecto B por URL manipulada');
  } finally {
    await cleanupTenant(tenantId, proyectoB);
  }
}

async function main() {
  await setup();
  try {
    await testResidenciaConProyectoActivoNoLeeEstimacionDeOtroProyecto();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-aislamiento-cross-proyecto-mismo-tenant integration tests (control-proyectos)');
  console.error(error);
  process.exitCode = 1;
});
