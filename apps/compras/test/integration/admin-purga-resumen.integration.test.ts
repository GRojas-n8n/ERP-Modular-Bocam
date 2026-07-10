/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: GET /api/v1/compras/admin/purga/resumen
 * Spec:  openspec/changes/panel-purga-datos-prueba-compras/specs/
 * Tareas: 2.1–2.2 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const comprasStarted = await startHttpApp(comprasModule.app);
  comprasServer = comprasStarted.server;
  comprasBaseUrl = comprasStarted.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.ordenCompra.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicionItem.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.requisicion.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedResumen() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: { tenant_id: tenantId, rfc_tax_id: `RFC${Date.now()}`, razon_social: 'Proveedor Resumen', estatus: 'ACTIVO' },
  });
  const requisicion = await prisma.requisicion.create({
    data: { tenant_id: tenantId, proyecto_id: proyectoId, codigo: `REQ-RES-${Date.now()}`, solicitante_id: randomUUID(), estado: 'APROBADA' },
  });
  const oc = await prisma.ordenCompra.create({
    data: {
      tenant_id: tenantId, proyecto_id: proyectoId, proveedor_id: proveedor.id_proveedor,
      codigo: `OC-RES-${Date.now()}`, subtotal: '100.00', iva: '16.00', total: '116.00',
    },
  });

  return { tenantId, proyectoId, requisicionId: requisicion.id_requisicion, proveedorId: proveedor.id_proveedor, ocId: oc.id_orden };
}

// ── 2.1: sin rol admin -> 403 ────────────────────────────────────────────────

async function testResumenSinRolAdmin() {
  const s = await seedResumen();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['procurement'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/admin/purga/resumen`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(response.status, 403);

    console.log('ok - 2.1: resumen de purga sin rol admin responde 403');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── 2.2: con rol admin -> 200 con listas ────────────────────────────────────

async function testResumenConRolAdmin() {
  const s = await seedResumen();
  try {
    const token = signTenantToken({ userId: randomUUID(), tenantId: s.tenantId, proyectoId: s.proyectoId, roles: ['admin'] });

    const response = await fetch(`${comprasBaseUrl}/api/v1/compras/admin/purga/resumen`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    const data = body.data;

    assert.equal(data.requisiciones.some((r: any) => r.id === s.requisicionId), true);
    assert.equal(data.ordenes_compra.some((o: any) => o.id === s.ocId), true);
    assert.equal(data.proveedores.some((p: any) => p.id === s.proveedorId), true);

    console.log('ok - 2.2: resumen de purga con rol admin devuelve las 3 listas del proyecto activo');
  } finally {
    await cleanupTenant(s.tenantId);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await setup();
  try {
    await testResumenSinRolAdmin();  // 2.1
    await testResumenConRolAdmin();  // 2.2
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - admin-purga-resumen integration tests');
  console.error(error);
  process.exitCode = 1;
});
