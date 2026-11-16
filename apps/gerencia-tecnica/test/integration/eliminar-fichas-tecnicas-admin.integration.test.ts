/**
 * Test de Integración: DELETE /insumos/:id/fichas/:fid queda restringido a admin.
 * Spec: openspec/changes/eliminacion-admin-archivos-importaciones-gt
 * Tareas: 2.2-2.4 del tasks.md
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
  await prisma.fichaTecnicaInsumo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.insumo.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedInsumoConFicha() {
  const tenantId = randomUUID();
  const insumo = await prisma.insumo.create({
    data: {
      tenant_id: tenantId,
      clave: `FT-${Date.now()}`,
      descripcion: 'Insumo de prueba borrado de ficha técnica',
      unidad_medida: 'PZA',
      tipo_insumo: 'MATERIAL',
      costo_base: 100,
    },
  });
  const ficha = await prisma.fichaTecnicaInsumo.create({
    data: {
      tenant_id: tenantId,
      insumo_id: insumo.id,
      nombre_doc: 'ficha-prueba.pdf',
      ruta_archivo: `${tenantId}/${insumo.id}/no-existe.pdf`,
      mime_type: 'application/pdf',
      tamano_bytes: 8,
      subido_por: randomUUID(),
    },
  });
  return { tenantId, insumoId: insumo.id, fichaId: ficha.id_ficha };
}

function token(tenantId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles });
}

async function deleteFicha(tenantId: string, insumoId: string, fichaId: string, roles: string[]) {
  const t = token(tenantId, roles);
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas/${fichaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}` },
  });
}

// ── Test 2.2: admin puede eliminar una ficha técnica ──

async function testAdminPuedeEliminarFicha() {
  const seeded = await seedInsumoConFicha();
  try {
    const r = await deleteFicha(seeded.tenantId, seeded.insumoId, seeded.fichaId, ['admin']);
    assert.equal(r.status, 200, 'admin debe poder eliminar una ficha técnica (200)');

    const restante = await prisma.fichaTecnicaInsumo.findUnique({ where: { id_ficha: seeded.fichaId } });
    assert.equal(restante, null, 'la ficha debe haberse eliminado de la base');

    console.log('ok - 2.2 admin puede eliminar una ficha técnica');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 2.3: residencia/resident ya NO puede eliminar una ficha técnica ──

async function testResidenciaYaNoPuedeEliminarFicha() {
  for (const rol of ['residencia', 'resident']) {
    const seeded = await seedInsumoConFicha();
    try {
      const r = await deleteFicha(seeded.tenantId, seeded.insumoId, seeded.fichaId, [rol]);
      assert.equal(r.status, 403, `${rol} ya no debe poder eliminar una ficha técnica (403)`);

      const sigueExistiendo = await prisma.fichaTecnicaInsumo.findUnique({ where: { id_ficha: seeded.fichaId } });
      assert.notEqual(sigueExistiendo, null, 'la ficha NO debe haberse eliminado');

      console.log(`ok - 2.3 ${rol} recibe 403 al intentar eliminar una ficha técnica`);
    } finally {
      await cleanupTenant(seeded.tenantId);
    }
  }
}

// ── Test 2.4: procurement/gerencia_tecnica ya NO pueden eliminar una ficha técnica ──

async function testProcurementYGerenciaTecnicaYaNoPueden() {
  for (const rol of ['procurement', 'gerencia_tecnica']) {
    const seeded = await seedInsumoConFicha();
    try {
      const r = await deleteFicha(seeded.tenantId, seeded.insumoId, seeded.fichaId, [rol]);
      assert.equal(r.status, 403, `${rol} ya no debe poder eliminar una ficha técnica (403)`);

      console.log(`ok - 2.4 ${rol} recibe 403 al intentar eliminar una ficha técnica`);
    } finally {
      await cleanupTenant(seeded.tenantId);
    }
  }
}

async function main() {
  await setup();
  try {
    await testAdminPuedeEliminarFicha();          // 2.2
    await testResidenciaYaNoPuedeEliminarFicha(); // 2.3
    await testProcurementYGerenciaTecnicaYaNoPueden(); // 2.4
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('FALLÓ: eliminar-fichas-tecnicas-admin integration tests');
  console.error(error);
  process.exitCode = 1;
});
