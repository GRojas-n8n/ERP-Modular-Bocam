/**
 * Test rojo de seguridad: una ruta project-scoped no puede convertir
 * proyecto_id vacío en una consulta global del tenant.
 *
 * Runner:
 * npm run test:integration:presupuestos-requieren-proyecto -w @bocam/gerencia-tecnica
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';
process.env.DATABASE_URL = DB_URL;
process.env.GERENCIA_TECNICA_DATABASE_URL = DB_URL;
process.env.FICHAS_UPLOAD_DIR = join(tmpdir(), 'iretum-gt-test-fichas');

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });
let server: Server | undefined;
let baseUrl = '';

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

async function seedPresupuesto(tenantId: string, proyectoId: string, version: number) {
  return prisma.presupuestoBase.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, version, importe_total: 0 },
  });
}

async function cleanup(tenantId: string) {
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, projects: string[], userId = randomUUID()) {
  return signTenantToken({
    userId,
    tenantId,
    proyectoId,
    projects,
    roles: ['admin'],
  });
}

async function getPresupuestos(accessToken: string) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuestos`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

async function testProyectoVacioEsRechazadoAntesDeConsultar() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();

  try {
    await seedPresupuesto(tenantId, proyectoA, 1);
    await seedPresupuesto(tenantId, proyectoB, 2);

    const cuentaSinProyectos = randomUUID();
    const response = await getPresupuestos(token(tenantId, '', [], cuentaSinProyectos));
    assert.equal(response.status, 403, 'admin sin proyecto debe recibir 403, no un listado global');

    const body = await response.json() as any;
    assert.equal(body.error?.code, 'AUTH_PROJECT_REQUIRED');
  } finally {
    await cleanup(tenantId);
  }
}

async function testCuentaConDosProyectosPuedeAlternarSinMezclarDatos() {
  const tenantId = randomUUID();
  const proyectoA = randomUUID();
  const proyectoB = randomUUID();

  try {
    const presupuestoA = await seedPresupuesto(tenantId, proyectoA, 1);
    const presupuestoB = await seedPresupuesto(tenantId, proyectoB, 2);
    const cuentaDosProyectos = randomUUID();

    const responseA = await getPresupuestos(token(
      tenantId, proyectoA, [proyectoA, proyectoB], cuentaDosProyectos
    ));
    assert.equal(responseA.status, 200);

    const bodyA = await responseA.json() as any;
    assert.deepEqual(bodyA.data.map((p: any) => p.id), [presupuestoA.id]);
    assert.ok(bodyA.data.every((p: any) => p.proyecto_id === proyectoA));

    const responseB = await getPresupuestos(token(
      tenantId, proyectoB, [proyectoA, proyectoB], cuentaDosProyectos
    ));
    assert.equal(responseB.status, 200);

    const bodyB = await responseB.json() as any;
    assert.deepEqual(bodyB.data.map((p: any) => p.id), [presupuestoB.id]);
    assert.ok(bodyB.data.every((p: any) => p.proyecto_id === proyectoB));
  } finally {
    await cleanup(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCuentaConDosProyectosPuedeAlternarSinMezclarDatos();
    console.log('ok - cuenta con dos proyectos alterna A/B sin mezclar presupuestos');
    await testProyectoVacioEsRechazadoAntesDeConsultar();
    console.log('ok - cuenta sin proyectos recibe 403 sin datos');
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - presupuestos-requieren-proyecto integration tests');
  console.error(error);
  process.exitCode = 1;
});
