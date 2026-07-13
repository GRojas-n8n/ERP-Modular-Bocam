/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: POST /proveedores/importar-lote (Compras)
 * Spec:  openspec/changes/carga-masiva-proveedores-compras/specs/carga-masiva-proveedores/
 * Tarea: 1.10 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const comprasDbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=compras';

const prisma = new PrismaClient({ datasources: { db: { url: comprasDbUrl } } });

let comprasServer: Server | undefined;
let comprasBaseUrl = '';

async function setup() {
  const comprasModule = await import('../../src/main');
  const started = await startHttpApp(comprasModule.app);
  comprasServer = started.server;
  comprasBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(comprasServer);
  await prisma.$disconnect();
}

async function cleanupTenant(tenantId: string) {
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
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
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const sufijo = Date.now().toString().slice(-8);
    const r = await post('/api/v1/compras/proveedores/importar-lote', token, {
      registros: [
        { rfc_tax_id: `PA${sufijo}1`, razon_social: 'Proveedor Lote A' },
        { rfc_tax_id: `PA${sufijo}2`, razon_social: 'Proveedor Lote B', calificacion_desempeno: 4.5 },
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

// ── Test: lote mixto (válidos, sin RFC, calificación fuera de rango) ────────

async function testLoteMixto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const sufijo = Date.now().toString().slice(-8);
    const r = await post('/api/v1/compras/proveedores/importar-lote', token, {
      registros: [
        { rfc_tax_id: `PM${sufijo}1`, razon_social: 'Proveedor Mixto Válido' },
        { rfc_tax_id: '', razon_social: 'Sin RFC' },
        { rfc_tax_id: `PM${sufijo}3`, razon_social: 'Calificación Inválida', calificacion_desempeno: 7 },
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

// ── Test: RFC duplicado dentro del mismo archivo (incluyendo distinto case) ─

async function testRfcDuplicadoDentroDelArchivo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const sufijo = Date.now().toString().slice(-8);
    const rfcMinusculas = `pd${sufijo}`;
    const r = await post('/api/v1/compras/proveedores/importar-lote', token, {
      registros: [
        { rfc_tax_id: rfcMinusculas, razon_social: 'Primera Fila' },
        { rfc_tax_id: rfcMinusculas.toUpperCase(), razon_social: 'Segunda Fila (mismo RFC, distinto case)' },
      ],
    });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.creados, 0, 'ninguna de las dos filas con RFC duplicado (normalizado) debe crearse');
    assert.equal(body.data.errores.length, 2, 'ambas filas deben reportarse como error');
    assert.match(body.data.errores[0].motivo, /RFC duplicado/);

    const enBd = await prisma.proveedor.findFirst({ where: { tenant_id: tenantId, rfc_tax_id: rfcMinusculas.toUpperCase() } });
    assert.equal(enBd, null, 'no debe haber quedado ningún registro con ese RFC');

    console.log('ok - RFC duplicado dentro del mismo archivo (normalizado a mayúsculas) se rechaza en ambas filas');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: rol sin procurement/admin recibe 403 ──────────────────────────────

async function testRolSinPermisoEs403() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['superintendent'] });

  try {
    const r = await post('/api/v1/compras/proveedores/importar-lote', token, {
      registros: [{ rfc_tax_id: 'RNOPERM', razon_social: 'No Debe Crearse' }],
    });
    assert.equal(r.status, 403, 'rol sin procurement/admin debe recibir 403');

    const enBd = await prisma.proveedor.findFirst({ where: { tenant_id: tenantId } });
    assert.equal(enBd, null, 'no debe haberse creado ningún registro');

    console.log('ok - rol sin procurement/admin (superintendent) recibe 403 y no crea nada');
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
    await testRolSinPermisoEs403();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - proveedores-importar-lote integration tests');
  console.error(error);
  process.exitCode = 1;
});
