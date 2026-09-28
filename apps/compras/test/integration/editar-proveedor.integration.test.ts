/**
 * Tests de integración: edición de datos guardados de un Proveedor
 * (PUT /api/v1/compras/proveedores/:id), incluyendo corrección del RFC.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL ||
        'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras',
    },
  },
});

let server: Server | undefined;
let baseUrl = '';

const put = (path: string, token: string, body: object) =>
  fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

async function testEditaDatosYRfc() {
  const tenantId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['procurement'] });
  try {
    const p = await prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: 'EDIT010101AA1', razon_social: 'Original' } });
    const r = await put(`/api/v1/compras/proveedores/${p.id_proveedor}`, token, {
      rfc_tax_id: ' edit020202bb2 ', razon_social: 'Nueva Razón', telefono: '5511112222', ciudad: 'CDMX',
    });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.rfc_tax_id, 'EDIT020202BB2', 'el RFC se normaliza');
    assert.equal(body.data.razon_social, 'Nueva Razón');
    assert.equal(body.data.telefono, '5511112222');
    console.log('ok - PUT proveedor edita datos y RFC');
  } finally {
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function testRfcDuplicadoDa409() {
  const tenantId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['procurement'] });
  try {
    await prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: 'DUPL010101AA1', razon_social: 'A' } });
    const b = await prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: 'DUPL020202BB2', razon_social: 'B' } });
    const r = await put(`/api/v1/compras/proveedores/${b.id_proveedor}`, token, { rfc_tax_id: 'DUPL010101AA1' });
    assert.equal(r.status, 409);
    console.log('ok - PUT proveedor con RFC duplicado responde 409');
  } finally {
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function testVaciosRechazados() {
  const tenantId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['procurement'] });
  try {
    const p = await prisma.proveedor.create({ data: { tenant_id: tenantId, rfc_tax_id: 'VACI010101AA1', razon_social: 'X' } });
    assert.equal((await put(`/api/v1/compras/proveedores/${p.id_proveedor}`, token, { rfc_tax_id: '  ' })).status, 400);
    assert.equal((await put(`/api/v1/compras/proveedores/${p.id_proveedor}`, token, { razon_social: '' })).status, 400);
    console.log('ok - PUT proveedor rechaza RFC o razón social vacíos');
  } finally {
    await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function main() {
  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  server = started.server;
  baseUrl = started.baseUrl;
  try {
    await testEditaDatosYRfc();
    await testRfcDuplicadoDa409();
    await testVaciosRechazados();
  } finally {
    await stopHttpApp(server);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - editar-proveedor integration tests');
  console.error(error);
  process.exitCode = 1;
});
