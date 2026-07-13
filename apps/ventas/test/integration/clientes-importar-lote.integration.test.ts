/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: POST /clientes/importar-lote (Ventas)
 * Spec:  openspec/changes/carga-masiva-clientes-ventas/specs/carga-masiva-clientes/
 * Tarea: 1.9 del tasks.md
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

// ── Test: lote 100% válido ───────────────────────────────────────────────────

async function testLoteTodosValidos() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const sufijo = Date.now().toString().slice(-8);
    const r = await post('/api/v1/ventas/clientes/importar-lote', token, {
      registros: [
        { rfc_tax_id: `LA${sufijo}1`, razon_social: 'Cliente Lote A' },
        { rfc_tax_id: `LA${sufijo}2`, razon_social: 'Cliente Lote B' },
      ],
    });
    assert.equal(r.status, 200, 'lote 100% válido debe responder 200');
    const body = (await r.json()) as any;
    assert.equal(body.data.creados, 2, 'ambos registros deben crearse');
    assert.equal(body.data.errores.length, 0, 'no debe haber errores');

    console.log('ok - lote 100% válido crea todos los registros');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: lote mixto (válidos e inválidos) ──────────────────────────────────

async function testLoteMixto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const sufijo = Date.now().toString().slice(-8);
    const r = await post('/api/v1/ventas/clientes/importar-lote', token, {
      registros: [
        { rfc_tax_id: `LM${sufijo}1`, razon_social: 'Cliente Mixto Válido' },
        { rfc_tax_id: '', razon_social: 'Sin RFC' },
        { rfc_tax_id: `LM${sufijo}3`, razon_social: 'Codigo Inválido', codigo_cliente: 'abc' },
      ],
    });
    assert.equal(r.status, 200, 'lote mixto debe responder 200 (no aborta por errores parciales)');
    const body = (await r.json()) as any;
    assert.equal(body.data.creados, 1, 'solo el registro válido debe crearse');
    assert.equal(body.data.errores.length, 2, 'los 2 registros inválidos deben reportarse');
    assert.equal(body.data.errores[0].fila, 2);
    assert.equal(body.data.errores[1].fila, 3);

    console.log('ok - lote mixto crea válidos y reporta inválidos por fila sin abortar');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: RFC duplicado dentro del mismo archivo ────────────────────────────

async function testRfcDuplicadoDentroDelArchivo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['admin'] });

  try {
    const sufijo = Date.now().toString().slice(-8);
    const rfcRepetido = `LD${sufijo}`;
    const r = await post('/api/v1/ventas/clientes/importar-lote', token, {
      registros: [
        { rfc_tax_id: rfcRepetido, razon_social: 'Primera Fila' },
        { rfc_tax_id: rfcRepetido, razon_social: 'Segunda Fila' },
      ],
    });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.creados, 0, 'ninguna de las dos filas con RFC duplicado debe crearse');
    assert.equal(body.data.errores.length, 2, 'ambas filas deben reportarse como error');
    assert.match(body.data.errores[0].motivo, /RFC duplicado/);

    const enBd = await prisma.cliente.findFirst({ where: { tenant_id: tenantId, rfc_tax_id: rfcRepetido } });
    assert.equal(enBd, null, 'no debe haber quedado ningún registro con ese RFC');

    console.log('ok - RFC duplicado dentro del mismo archivo se rechaza en ambas filas');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: rol sin admin recibe 403 ──────────────────────────────────────────

async function testRolSinAdminEs403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const r = await post('/api/v1/ventas/clientes/importar-lote', token, {
      registros: [{ rfc_tax_id: 'RNOADMIN', razon_social: 'No Debe Crearse' }],
    });
    assert.equal(r.status, 403, 'rol sin admin debe recibir 403');

    const enBd = await prisma.cliente.findFirst({ where: { tenant_id: tenantId } });
    assert.equal(enBd, null, 'no debe haberse creado ningún registro');

    console.log('ok - rol sin admin recibe 403 y no crea nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testLoteTodosValidos();
    await testLoteMixto();
    await testRfcDuplicadoDentroDelArchivo();
    await testRolSinAdminEs403();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - clientes-importar-lote integration tests');
  console.error(error);
  process.exitCode = 1;
});
