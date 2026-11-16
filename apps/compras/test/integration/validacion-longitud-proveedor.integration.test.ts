/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación de longitud de campos de texto de Proveedor
 * Spec:  openspec/changes/fix-compras-validacion-longitud-proveedor/
 * Tarea: 1.1-1.3 del tasks.md
 *
 * Mismo bug que fix-personal-validacion-longitud-empleado (archivado
 * 2026-08-26), pero en Compras: un rfc_tax_id/razon_social más largo que la
 * columna (`VARCHAR(20)`/`VARCHAR(255)`) hacía que POST/PUT /proveedores
 * respondieran 500 con el mensaje crudo de Prisma. Este archivo reproduce el
 * bug en los tres puntos de entrada (alta individual, edición, importación
 * masiva) y confirma el 400 claro tras el fix.
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

async function crearProveedor(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `TLO${sufijo}`,
      razon_social: 'Proveedor Test Longitud',
    },
  });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function put(path: string, token: string, body: object) {
  return fetch(`${comprasBaseUrl}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── 1.1 — alta individual con rfc_tax_id más largo que la columna ──────────

async function testAltaConRfcDemasiadoLargo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const r = await post('/api/v1/compras/proveedores', token, {
      rfc_tax_id: 'ESTE-RFC-ES-DEMASIADO-LARGO-PARA-LA-COLUMNA',
      razon_social: 'Proveedor Con RFC Largo',
    });

    assert.equal(r.status, 400, 'debe responder 400, no 500 con el mensaje crudo de Prisma');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(
      body.error.details?.some((d: any) => d.field === 'rfc_tax_id'),
      'el detalle debe nombrar el campo rfc_tax_id'
    );

    const creado = await prisma.proveedor.findFirst({ where: { tenant_id: tenantId } });
    assert.equal(creado, null, 'no debe crearse ningún registro');

    console.log('ok - POST /proveedores con rfc_tax_id demasiado largo responde 400 claro, sin crear el registro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.1b — alta individual con campos dentro del límite sigue funcionando ──

async function testAltaConCamposValidosSigueFuncionando() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });
  const sufijo = Date.now().toString().slice(-6);

  try {
    const r = await post('/api/v1/compras/proveedores', token, {
      rfc_tax_id: `PEJ${sufijo}A`,
      razon_social: 'Proveedor Válido',
    });

    assert.equal(r.status, 201, 'un alta con campos dentro del límite no debe verse afectada por el fix');
    console.log('ok - POST /proveedores con campos válidos sigue creando el proveedor con normalidad');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.2 — edición con razon_social más larga que la columna ────────────────

async function testEdicionConRazonSocialDemasiadoLarga() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });

  try {
    const prov = await crearProveedor(tenantId);
    const razonSocialLarga = 'X'.repeat(256);

    const r = await put(`/api/v1/compras/proveedores/${prov.id_proveedor}`, token, {
      razon_social: razonSocialLarga,
    });

    assert.equal(r.status, 400, 'debe responder 400, no 500 con el mensaje crudo de Prisma');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(
      body.error.details?.some((d: any) => d.field === 'razon_social'),
      'el detalle debe nombrar el campo razon_social'
    );

    const sinCambios = await prisma.proveedor.findUnique({ where: { id_proveedor: prov.id_proveedor } });
    assert.equal(sinCambios?.razon_social, 'Proveedor Test Longitud', 'el registro no debe modificarse');

    console.log('ok - PUT /proveedores/:id con razon_social demasiado larga responde 400 claro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.3 — importación masiva: una fila con razon_social demasiado larga, el resto válido ─

async function testImportacionConUnaFilaRazonSocialDemasiadoLarga() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['procurement'] });
  const sufijo = Date.now().toString().slice(-6);

  try {
    const r = await post('/api/v1/compras/proveedores/importar-lote', token, {
      registros: [
        { rfc_tax_id: `GAA${sufijo}B`, razon_social: 'X'.repeat(256) },
        { rfc_tax_id: `PEJ${sufijo}A`, razon_social: 'Proveedor Lote Válido' },
      ],
    });

    assert.equal(r.status, 200, 'el lote no debe abortar completo por una fila inválida');
    const body = (await r.json()) as any;
    assert.equal(body.data.creados, 1, 'solo la fila válida debe crearse');
    assert.equal(body.data.errores.length, 1, 'la fila con razon_social demasiado larga debe reportarse como error');
    assert.equal(body.data.errores[0].fila, 1, 'debe reportar la fila 1 (la de razon_social inválida)');
    assert.match(body.data.errores[0].motivo, /razon_social/i, 'el motivo debe mencionar el campo razon_social');

    console.log('ok - importar-lote reporta por fila una razon_social demasiado larga, sin abortar el resto del lote');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAltaConRfcDemasiadoLargo();
    await testAltaConCamposValidosSigueFuncionando();
    await testEdicionConRazonSocialDemasiadoLarga();
    await testImportacionConUnaFilaRazonSocialDemasiadoLarga();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-longitud-proveedor integration tests');
  console.error(error);
  process.exitCode = 1;
});
