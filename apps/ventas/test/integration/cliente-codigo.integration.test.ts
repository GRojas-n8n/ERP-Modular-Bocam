/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: codigo_cliente en Cliente (Ventas)
 * Spec:  openspec/changes/centro-costos-alta-formal/specs/centro-costos-alta/
 * Tareas: 2.1-2.2 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (VENTAS_DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

const ventasDbUrl = process.env.VENTAS_DATABASE_URL || process.env.DATABASE_URL!;
const prisma = new PrismaClient({ datasources: { db: { url: ventasDbUrl } } });

let ventasServer: Server | undefined;
let ventasBaseUrl = '';

async function setup() {
  const ventasModule = await import('../../src/main');
  const started = await startHttpApp(ventasModule.app);
  ventasServer = started.server;
  ventasBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(ventasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.cliente.deleteMany({ where: { tenant_id: tenantId } });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${ventasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Test 2.1: codigo_cliente fuera de rango/formato es rechazado ────────────

async function testCodigoClienteInvalidoEsRechazado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const casosInvalidos = [
      { codigo_cliente: '051', razon: 'fuera de rango (> 050)' },
      { codigo_cliente: 'abc', razon: 'no numérico' },
      { codigo_cliente: '1', razon: 'menos de 3 dígitos' },
    ];

    for (const caso of casosInvalidos) {
      const r = await post('/api/v1/ventas/clientes', token, {
        rfc_tax_id: `R${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 5)}`,
        razon_social: 'Cliente Test Inválido',
        codigo_cliente: caso.codigo_cliente,
      });
      assert.equal(r.status, 400, `codigo_cliente "${caso.codigo_cliente}" (${caso.razon}) debe rechazarse con 400`);
    }

    // Duplicado dentro del mismo tenant
    const rfcA = `RA${Date.now().toString().slice(-10)}`;
    const rfcB = `RB${Date.now().toString().slice(-10)}`;
    const r1 = await post('/api/v1/ventas/clientes', token, {
      rfc_tax_id: rfcA, razon_social: 'Cliente A', codigo_cliente: '020',
    });
    assert.equal(r1.status, 201, 'primer cliente con codigo_cliente 020 debe crearse');

    const r2 = await post('/api/v1/ventas/clientes', token, {
      rfc_tax_id: rfcB, razon_social: 'Cliente B', codigo_cliente: '020',
    });
    assert.equal(r2.status, 409, 'segundo cliente con el mismo codigo_cliente (020) en el mismo tenant debe rechazarse con 409');

    console.log('ok - 2.1 codigo_cliente fuera de rango, no numérico o duplicado es rechazado');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2.2: codigo_cliente válido y único persiste correctamente ──────────

async function testCodigoClienteValidoPersiste() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const r = await post('/api/v1/ventas/clientes', token, {
      rfc_tax_id: `RV${Date.now().toString().slice(-10)}`,
      razon_social: 'Cliente Válido S.A. de C.V.',
      codigo_cliente: '004',
    });
    assert.equal(r.status, 201, 'cliente con codigo_cliente válido debe crearse');
    const body = (await r.json()) as any;
    assert.equal(body.data.codigo_cliente, '004');

    const enBd = await prisma.cliente.findUnique({ where: { id_cliente: body.data.id_cliente } });
    assert.equal(enBd?.codigo_cliente, '004');

    console.log('ok - 2.2 codigo_cliente válido y único persiste correctamente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCodigoClienteInvalidoEsRechazado(); // 2.1
    await testCodigoClienteValidoPersiste();       // 2.2
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - cliente-codigo integration tests');
  console.error(error);
  process.exitCode = 1;
});
