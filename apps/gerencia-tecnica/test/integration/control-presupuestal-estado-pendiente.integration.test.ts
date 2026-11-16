/**
 * Test de Integración: GET /reportes/control-presupuestal distingue "sin
 * ningún presupuesto" de "presupuesto existente pero no aprobado".
 * Spec: openspec/changes/control-presupuestal-estado-presupuesto-visible/
 *
 * Antes de este fix, un presupuesto recién importado (estado BORRADOR por
 * default al crearse) hacía que este endpoint devolviera el mismo 404
 * genérico GT_NO_PRESUPUESTO que "no hay nada" — sin distinguir "hay que
 * aprobar" de "no se ha importado nada todavía".
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const DB_URL =
  process.env.GT_DATABASE_URL ||
  process.env.DATABASE_URL    ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=gerencia_tecnica';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

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
  await prisma.concepto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
}

async function getControlPresupuestal(tenantId: string, proyectoId: string, roles: string[]) {
  const t = signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
  const r = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/reportes/control-presupuestal`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  return { status: r.status, body: await r.json() };
}

// ── Sin ningún presupuestoBase: sigue siendo GT_NO_PRESUPUESTO (no regresiona) ──
async function testSinPresupuestoAlguno() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const { status, body } = await getControlPresupuestal(tenantId, proyectoId, ['gerencia_tecnica']);
    assert.equal(status, 404);
    assert.equal(body.error.code, 'GT_NO_PRESUPUESTO', 'sin ningún presupuestoBase, el código debe seguir siendo GT_NO_PRESUPUESTO');
    console.log('ok - sin presupuestoBase → GT_NO_PRESUPUESTO (sin regresión)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Presupuesto en BORRADOR (default al crear): nuevo código enriquecido ──
async function testPresupuestoBorradorDaCodigoEnriquecido() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const presupuesto = await prisma.presupuestoBase.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId }, // estado por default: BORRADOR
    });

    const { status, body } = await getControlPresupuestal(tenantId, proyectoId, ['gerencia_tecnica']);
    assert.equal(status, 404);
    assert.equal(body.error.code, 'GT_PRESUPUESTO_PENDIENTE_APROBACION');
    assert.equal(body.error.details.presupuesto_id, presupuesto.id);
    assert.equal(body.error.details.estado, 'BORRADOR');
    console.log('ok - presupuesto BORRADOR → GT_PRESUPUESTO_PENDIENTE_APROBACION con presupuesto_id/estado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Presupuesto en EN_REVISION: mismo tratamiento que BORRADOR ──
async function testPresupuestoEnRevisionMismoTratamiento() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const presupuesto = await prisma.presupuestoBase.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'EN_REVISION' },
    });

    const { status, body } = await getControlPresupuestal(tenantId, proyectoId, ['gerencia_tecnica']);
    assert.equal(status, 404);
    assert.equal(body.error.code, 'GT_PRESUPUESTO_PENDIENTE_APROBACION');
    assert.equal(body.error.details.estado, 'EN_REVISION');
    console.log('ok - presupuesto EN_REVISION → mismo código enriquecido que BORRADOR');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Presupuesto APROBADO: camino feliz sin cambios (regresión) ──
async function testPresupuestoAprobadoSinCambios() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const presupuesto = await prisma.presupuestoBase.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId, estado: 'APROBADO' },
    });
    await prisma.concepto.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id,
        clave: 'C-1', descripcion: 'Concepto de prueba', unidad_medida: 'M2',
        cantidad: 1, precio_unitario: 100, importe: 100,
      },
    });

    const { status, body } = await getControlPresupuestal(tenantId, proyectoId, ['gerencia_tecnica']);
    assert.equal(status, 200, 'presupuesto APROBADO debe seguir respondiendo 200 con datos reales');
    assert.equal(body.data.presupuesto_id, presupuesto.id);
    assert.equal(body.data.total_presupuestado, 100);
    console.log('ok - presupuesto APROBADO → 200 con datos reales (camino feliz sin cambios)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testSinPresupuestoAlguno();
    await testPresupuestoBorradorDaCodigoEnriquecido();
    await testPresupuestoEnRevisionMismoTratamiento();
    await testPresupuestoAprobadoSinCambios();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - control-presupuestal-estado-pendiente integration tests');
  console.error(error);
  process.exitCode = 1;
});
