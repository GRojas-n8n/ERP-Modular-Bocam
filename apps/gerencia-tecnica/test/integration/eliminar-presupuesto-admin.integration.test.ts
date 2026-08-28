/**
 * Test de Integración: DELETE /presupuestos/:id revierte un Catálogo de
 * Conceptos importado por error.
 * Spec: openspec/changes/eliminacion-admin-archivos-importaciones-gt
 * Tareas: 3.4-3.6 del tasks.md
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
  await prisma.saldoPartida.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.conceptoInsumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.concepto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedPresupuestoConConcepto(tenantId: string, proyectoId: string) {
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
  return { presupuestoId: presupuesto.id, conceptoId: concepto.id };
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function eliminarPresupuesto(tenantId: string, proyectoId: string, presupuestoId: string, roles: string[]) {
  const t = token(tenantId, proyectoId, roles);
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuestos/${presupuestoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
}

// ── Test 3.4: admin, gerencia_tecnica y control_proyectos eliminan un presupuesto sin uso ──

async function testRolesHabilitadosEliminanPresupuestoSinUso() {
  for (const rol of ['admin', 'gerencia_tecnica', 'control_proyectos']) {
    const tenantId = randomUUID();
    const proyectoId = randomUUID();
    try {
      const { presupuestoId, conceptoId } = await seedPresupuestoConConcepto(tenantId, proyectoId);

      const r = await eliminarPresupuesto(tenantId, proyectoId, presupuestoId, [rol]);
      assert.equal(r.status, 200, `${rol} debe poder eliminar un presupuesto sin uso (200)`);

      const presupuestoTrasBorrado = await prisma.presupuestoBase.findUnique({ where: { id: presupuestoId } });
      assert.equal(presupuestoTrasBorrado, null, 'el presupuesto debe haberse eliminado');
      const conceptoTrasBorrado = await prisma.concepto.findUnique({ where: { id: conceptoId } });
      assert.equal(conceptoTrasBorrado, null, 'el concepto debe haberse eliminado en cascada');

      console.log(`ok - 3.4 ${rol} elimina un presupuesto sin uso y su cascada`);
    } finally {
      await cleanupTenant(tenantId);
    }
  }
}

// ── Test 3.5: un presupuesto con compromiso financiero registrado responde 409 ──

async function testPresupuestoConCompromisoResponde409() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const { presupuestoId, conceptoId } = await seedPresupuestoConConcepto(tenantId, proyectoId);
    await prisma.saldoPartida.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: conceptoId,
        concepto_clave: 'C-1', concepto_desc: 'Concepto de prueba',
        monto_comprometido: 500,
      },
    });

    const r = await eliminarPresupuesto(tenantId, proyectoId, presupuestoId, ['admin']);
    assert.equal(r.status, 409, 'un presupuesto con compromiso financiero no debe poder eliminarse');

    const presupuestoTrasIntento = await prisma.presupuestoBase.findUnique({ where: { id: presupuestoId } });
    assert.notEqual(presupuestoTrasIntento, null, 'el presupuesto NO debe haberse eliminado');

    console.log('ok - 3.5 un presupuesto con compromiso financiero (SaldoPartida) responde 409');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 3.6: un rol no habilitado recibe 403 ──

async function testRolNoHabilitadoRecibe403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const { presupuestoId } = await seedPresupuestoConConcepto(tenantId, proyectoId);

    for (const rol of ['superintendent', 'procurement', 'control_obra']) {
      const r = await eliminarPresupuesto(tenantId, proyectoId, presupuestoId, [rol]);
      assert.equal(r.status, 403, `${rol} no debe poder eliminar un presupuesto`);
    }

    console.log('ok - 3.6 roles no habilitados (superintendent, procurement, control_obra) reciben 403');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testRolesHabilitadosEliminanPresupuestoSinUso(); // 3.4
    await testPresupuestoConCompromisoResponde409();        // 3.5
    await testRolNoHabilitadoRecibe403();                   // 3.6
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('FALLÓ: eliminar-presupuesto-admin integration tests');
  console.error(error);
  process.exitCode = 1;
});
