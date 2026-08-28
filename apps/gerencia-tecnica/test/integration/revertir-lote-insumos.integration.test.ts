/**
 * Test de Integración: DELETE /insumos/importar-lote/:loteId revierte un lote
 * de Explosión de Insumos importado por error.
 * Spec: openspec/changes/eliminacion-admin-archivos-importaciones-gt
 * Tareas: 4.5-4.7 del tasks.md
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
  await prisma.loteImportacion.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function importarLote(tenantId: string, proyectoId: string, claves: string[]) {
  const t = token(tenantId, proyectoId, ['admin']);
  const r = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/importar-lote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: JSON.stringify({
      insumos: claves.map(clave => ({
        clave, descripcion: `Insumo ${clave}`, unidad_medida: 'PZA', tipo_insumo: 'MATERIAL', costo_base: 10,
      })),
    }),
  });
  assert.equal(r.status, 200, 'la importación de lote de setup debe responder 200');
  const body = await r.json() as any;
  assert.ok(body.data.lote_importacion_id, 'la respuesta debe incluir lote_importacion_id');
  return body.data.lote_importacion_id as string;
}

async function revertirLote(tenantId: string, proyectoId: string, loteId: string, roles: string[]) {
  const t = token(tenantId, proyectoId, roles);
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/importar-lote/${loteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
}

// ── Test 4.5: admin, gerencia_tecnica y control_proyectos revierten un lote sin uso ──

async function testRolesHabilitadosRevierteLoteSinUso() {
  for (const rol of ['admin', 'gerencia_tecnica', 'control_proyectos']) {
    const tenantId = randomUUID();
    const proyectoId = randomUUID();
    try {
      const loteId = await importarLote(tenantId, proyectoId, [`LOTE-${rol}-1`, `LOTE-${rol}-2`]);

      const r = await revertirLote(tenantId, proyectoId, loteId, [rol]);
      assert.equal(r.status, 200, `${rol} debe poder revertir un lote sin uso (200)`);

      const insumos = await prisma.insumo.findMany({ where: { tenant_id: tenantId, lote_importacion_id: loteId } });
      assert.equal(insumos.length, 2);
      assert.ok(insumos.every(i => i.activo === false), 'los insumos del lote deben quedar desactivados');

      const lote = await prisma.loteImportacion.findUnique({ where: { id: loteId } });
      assert.equal(lote?.estado, 'revertido');

      console.log(`ok - 4.5 ${rol} revierte un lote de insumos sin uso`);
    } finally {
      await cleanupTenant(tenantId);
    }
  }
}

// ── Test 4.6: un lote con insumos ya usados en una composición APU responde 409 ──

async function testLoteConInsumoEnUsoResponde409() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const loteId = await importarLote(tenantId, proyectoId, ['LOTE-USADO-1']);
    const insumo = await prisma.insumo.findFirstOrThrow({ where: { tenant_id: tenantId, lote_importacion_id: loteId } });

    const presupuesto = await prisma.presupuestoBase.create({
      data: { tenant_id: tenantId, proyecto_id: proyectoId },
    });
    const concepto = await prisma.concepto.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, presupuesto_id: presupuesto.id,
        clave: 'C-1', descripcion: 'Concepto de prueba', unidad_medida: 'M2',
        cantidad: 1, precio_unitario: 1, importe: 1,
      },
    });
    await prisma.conceptoInsumo.create({
      data: {
        tenant_id: tenantId, proyecto_id: proyectoId, concepto_id: concepto.id, insumo_id: insumo.id,
        tipo_insumo: 'MATERIAL', cantidad: 1,
      },
    });

    const r = await revertirLote(tenantId, proyectoId, loteId, ['admin']);
    assert.equal(r.status, 409, 'un lote con insumos usados en una composición APU no debe poder revertirse');

    const insumoTrasIntento = await prisma.insumo.findUnique({ where: { id: insumo.id } });
    assert.equal(insumoTrasIntento?.activo, true, 'el insumo NO debe haberse desactivado');

    console.log('ok - 4.6 un lote con insumos ya usados en una composición APU responde 409');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 4.7: un rol no habilitado recibe 403 ──

async function testRolNoHabilitadoRecibe403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const loteId = await importarLote(tenantId, proyectoId, ['LOTE-403-1']);

    const r = await revertirLote(tenantId, proyectoId, loteId, ['procurement']);
    assert.equal(r.status, 403, 'un rol no habilitado no debe poder revertir un lote de insumos');

    console.log('ok - 4.7 un rol no habilitado (procurement) recibe 403 al revertir un lote');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testRolesHabilitadosRevierteLoteSinUso(); // 4.5
    await testLoteConInsumoEnUsoResponde409();       // 4.6
    await testRolNoHabilitadoRecibe403();            // 4.7
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('FALLÓ: revertir-lote-insumos integration tests');
  console.error(error);
  process.exitCode = 1;
});
