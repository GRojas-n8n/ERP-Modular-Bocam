/**
 * Tests de Integración: IDOR cross-tenant en PATCH /inventario/:id
 * Spec: openspec/changes/fix-rls-almacen-tablas-sin-cobertura/
 *
 * `PATCH /api/v1/almacen/inventario/:id` hacía `update({ where: { id } })`
 * sin verificar tenant_id/proyecto_id, y devolvía la fila completa
 * actualizada — un usuario del tenant B podía leer y corromper un ítem de
 * inventario del tenant A conociendo su UUID. Este test reproduce el ataque
 * contra el endpoint HTTP real.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env) con
 *           apps/almacen/prisma/rls-policies.sql ya aplicado.
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.ALMACEN_DATABASE_URL ||
  process.env.DATABASE_URL         ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=almacen';

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
  await prisma.movimientoAlmacen.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.itemInventario.deleteMany({ where: { tenant_id: tenantId } });
}

async function patch(path: string, token: string, body: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function testIdorPatchInventarioCrossTenant() {
  const tenantA = randomUUID();
  const proyectoA = randomUUID();
  const tenantB = randomUUID();
  const proyectoB = randomUUID();

  const itemA = await prisma.itemInventario.create({
    data: {
      tenant_id: tenantA,
      proyecto_id: proyectoA,
      clave: 'ITEM-SECRETO-A',
      descripcion: 'Item secreto del tenant A',
      unidad: 'PZA',
      categoria: 'MATERIAL',
      stock_actual: 100,
      stock_minimo: 10,
      ubicacion: 'Bodega A-original',
    },
  });

  try {
    const tokenB = signTenantToken({ userId: randomUUID(), tenantId: tenantB, proyectoId: proyectoB, roles: ['admin'] });

    const r = await patch(`/api/v1/almacen/inventario/${itemA.id}`, tokenB, { ubicacion: 'HACKEADO-POR-TENANT-B' });

    assert.notEqual(
      r.status, 200,
      `Un usuario del tenant B pudo modificar un ítem de inventario del tenant A (status ${r.status}). ` +
      `itemInventario.update() no filtra por tenant_id y devuelve la fila completa.`
    );
    assert.equal(r.status, 404, 'debe responder 404 (no encontrado), no exponer/modificar el ítem de otro tenant');

    const itemTrasAtaque = await prisma.itemInventario.findUnique({ where: { id: itemA.id } });
    assert.equal(itemTrasAtaque?.ubicacion, 'Bodega A-original', 'el ítem del tenant A no debe haberse modificado');

    console.log('ok - PATCH /inventario/:id no permite leer/modificar un ítem de otro tenant (404 esperado)');
  } finally {
    await cleanupTenant(tenantA);
    await cleanupTenant(tenantB);
  }
}

async function main() {
  await setup();
  try {
    await testIdorPatchInventarioCrossTenant();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - rls-idor-inventario integration tests');
  console.error(error);
  process.exitCode = 1;
});
