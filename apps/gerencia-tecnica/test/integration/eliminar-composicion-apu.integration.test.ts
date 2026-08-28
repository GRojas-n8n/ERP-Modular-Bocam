/**
 * Test de Integración: DELETE /composicion-apu/:conceptoId elimina la
 * composición APU de un concepto importada por error.
 * Spec: openspec/changes/eliminacion-admin-archivos-importaciones-gt
 * Tareas: 5.4-5.6 del tasks.md
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
  await prisma.conceptoInsumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.concepto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedConceptoConComposicion(tenantId: string, proyectoId: string) {
  const presupuesto = await prisma.presupuestoBase.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId },
  });
  const concepto = await prisma.concepto.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id,
      clave: 'C-1', descripcion: 'Concepto de prueba', unidad_medida: 'M2',
      cantidad: 1, precio_unitario: 100, importe: 100,
    },
  });
  const insumo = await prisma.insumo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, clave: `INS-${Date.now()}`,
      descripcion: 'Insumo de prueba', unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10,
    },
  });
  await prisma.conceptoInsumo.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: concepto.id, insumo_id: insumo.id,
      tipo_insumo: 'MATERIAL', cantidad: 2,
    },
  });
  return { conceptoId: concepto.id };
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function eliminarComposicion(tenantId: string, proyectoId: string, conceptoId: string, roles: string[]) {
  const t = token(tenantId, proyectoId, roles);
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/composicion-apu/${conceptoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
}

// ── Test 5.4: admin, gerencia_tecnica y control_proyectos eliminan la composición APU ──

async function testRolesHabilitadosEliminanComposicion() {
  for (const rol of ['admin', 'gerencia_tecnica', 'control_proyectos']) {
    const tenantId = randomUUID();
    const proyectoId = randomUUID();
    try {
      const { conceptoId } = await seedConceptoConComposicion(tenantId, proyectoId);

      const r = await eliminarComposicion(tenantId, proyectoId, conceptoId, [rol]);
      assert.equal(r.status, 200, `${rol} debe poder eliminar la composición APU de un concepto (200)`);

      const restante = await prisma.conceptoInsumo.count({ where: { concepto_id: conceptoId } });
      assert.equal(restante, 0, 'no debe quedar ningún ConceptoInsumo para el concepto');
      const conceptoSigueExistiendo = await prisma.concepto.findUnique({ where: { id: conceptoId } });
      assert.notEqual(conceptoSigueExistiendo, null, 'el Concepto NO debe haberse eliminado');

      console.log(`ok - 5.4 ${rol} elimina la composición APU de un concepto`);
    } finally {
      await cleanupTenant(tenantId);
    }
  }
}

// ── Test 5.5: un concepto sin composición APU responde 404 ──

async function testConceptoSinComposicionResponde404() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const presupuesto = await prisma.presupuestoBase.create({ data: { tenant_id: tenantId, proyecto_id: proyectoId } });
    const concepto = await prisma.concepto.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id,
        clave: 'C-SIN-APU', descripcion: 'Concepto sin composición', unidad_medida: 'M2',
        cantidad: 1, precio_unitario: 1, importe: 1,
      },
    });

    const r = await eliminarComposicion(tenantId, proyectoId, concepto.id, ['admin']);
    assert.equal(r.status, 404, 'un concepto sin composición APU debe responder 404');

    console.log('ok - 5.5 un concepto sin composición APU responde 404');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 5.6: un rol no habilitado recibe 403 ──

async function testRolNoHabilitadoRecibe403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const { conceptoId } = await seedConceptoConComposicion(tenantId, proyectoId);

    const r = await eliminarComposicion(tenantId, proyectoId, conceptoId, ['procurement']);
    assert.equal(r.status, 403, 'un rol no habilitado no debe poder eliminar la composición APU');

    console.log('ok - 5.6 un rol no habilitado (procurement) recibe 403');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testRolesHabilitadosEliminanComposicion(); // 5.4
    await testConceptoSinComposicionResponde404();    // 5.5
    await testRolNoHabilitadoRecibe403();             // 5.6
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('FALLÓ: eliminar-composicion-apu integration tests');
  console.error(error);
  process.exitCode = 1;
});
