/**
 * Tests de integración: alta de Cliente sin proyecto activo (catálogo por
 * tenant) y edición de datos guardados (PUT /clientes/:id, p. ej. RFC real).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL + Redis corriendo
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.VENTAS_DATABASE_URL || process.env.DATABASE_URL! } } });
let server: Server | undefined;
let baseUrl = '';

const call = (method: string, path: string, token: string, body?: object) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

async function testAltaSinProyectoActivo() {
  const tenantId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: undefined as unknown as string, projects: [], roles: ['admin'] });
  try {
    const r = await call('POST', '/api/v1/ventas/clientes', token, { rfc_tax_id: 'xaxx010101000', razon_social: 'Cliente Sin Proyecto' });
    assert.equal(r.status, 201, 'alta de cliente no debe exigir proyecto activo');
    assert.equal(((await r.json()) as any).data.rfc_tax_id, 'XAXX010101000');
    for (const rol of ['gerencia_tecnica', 'control_proyectos']) {
      const t = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: undefined as unknown as string, projects: [], roles: [rol] });
      assert.equal((await call('GET', '/api/v1/ventas/clientes', t)).status, 200, `${rol} lista clientes sin proyecto`);
      assert.equal((await call('POST', '/api/v1/ventas/clientes', t, { rfc_tax_id: `R${rol.length}0101`, razon_social: rol })).status, 201, `${rol} crea cliente sin proyecto`);
    }
    const cot = await call('GET', '/api/v1/ventas/cotizaciones', token);
    assert.equal(cot.status, 403, 'lo demás de Ventas sigue exigiendo proyecto activo');
    console.log('ok - alta de cliente sin proyecto activo');
  } finally {
    await prisma.cliente.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function testEditarRfcYDuplicado() {
  const tenantId = randomUUID();
  const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['admin'] });
  try {
    const a = await prisma.cliente.create({ data: { tenant_id: tenantId, rfc_tax_id: 'PROVISIONAL1', razon_social: 'A' } });
    await prisma.cliente.create({ data: { tenant_id: tenantId, rfc_tax_id: 'REAL010101AA1', razon_social: 'B' } });

    const ok = await call('PUT', `/api/v1/ventas/clientes/${a.id_cliente}`, token, { rfc_tax_id: ' abc010101ab1 ', telefono: '5512345678' });
    assert.equal(ok.status, 200);
    assert.equal(((await ok.json()) as any).data.rfc_tax_id, 'ABC010101AB1');

    assert.equal((await call('PUT', `/api/v1/ventas/clientes/${a.id_cliente}`, token, { rfc_tax_id: 'REAL010101AA1' })).status, 409);
    assert.equal((await call('PUT', `/api/v1/ventas/clientes/${a.id_cliente}`, token, { rfc_tax_id: '  ' })).status, 400);
    assert.equal((await call('PUT', `/api/v1/ventas/clientes/${randomUUID()}`, token, { razon_social: 'X' })).status, 404);

    const noAdmin = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['procurement'] });
    assert.equal((await call('PUT', `/api/v1/ventas/clientes/${a.id_cliente}`, noAdmin, { razon_social: 'X' })).status, 403);
    console.log('ok - edición de cliente: RFC, duplicado, vacío, 404 y rol');
  } finally {
    await prisma.cliente.deleteMany({ where: { tenant_id: tenantId } });
  }
}

async function main() {
  const mod = await import('../../src/main');
  const started = await startHttpApp(mod.app);
  server = started.server;
  baseUrl = started.baseUrl;
  try {
    await testAltaSinProyectoActivo();
    await testEditarRfcYDuplicado();
  } finally {
    await stopHttpApp(server);
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('not ok - cliente-sin-proyecto-y-edicion integration tests');
  console.error(error);
  process.exitCode = 1;
});
