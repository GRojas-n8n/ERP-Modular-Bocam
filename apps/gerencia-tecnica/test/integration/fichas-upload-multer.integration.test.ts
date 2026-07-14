/**
 * Tests de Integración: comportamiento de subida de fichas técnicas (multer)
 * Spec:  openspec/changes/actualizar-multer-v2-seguridad/
 * Tarea: 1.1 del tasks.md — fija el comportamiento actual (multer 1.x) que la
 * actualización a 2.x NO debe alterar (ver specs/carga-archivos-multer).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';
process.env.FICHAS_MAX_SIZE_MB = process.env.FICHAS_MAX_SIZE_MB || '1'; // límite bajo a propósito para poder excederlo en el test

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

async function seedInsumo() {
  const tenantId = randomUUID();
  const insumo = await prisma.insumo.create({
    data: {
      tenant_id: tenantId,
      clave: `FTM-${Date.now()}`,
      descripcion: 'Insumo de prueba upload multer',
      unidad_medida: 'PZA',
      tipo_insumo: 'MATERIAL',
      costo_base: 100,
    },
  });
  return { tenantId, insumoId: insumo.id };
}

function token(tenantId: string) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['residencia'] });
}

async function uploadFicha(baseUrlLocal: string, t: string, insumoId: string, bytes: Uint8Array, filename: string, mime: string) {
  const form = new FormData();
  form.append('archivo', new Blob([bytes], { type: mime }), filename);
  form.append('nombre_doc', filename);
  return fetch(`${baseUrlLocal}/api/v1/gerencia-tecnica/insumos/${insumoId}/fichas`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}` },
    body: form,
  });
}

// ── 1: extensión permitida → 201 ──

async function testExtensionPermitida() {
  const seeded = await seedInsumo();
  try {
    const t = token(seeded.tenantId);
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
    const r = await uploadFicha(baseUrl, t, seeded.insumoId, bytes, 'ficha.pdf', 'application/pdf');
    assert.equal(r.status, 201, 'extensión .pdf permitida debe aceptarse (201)');

    console.log('ok - extensión permitida (.pdf) sube con éxito');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── 2: extensión no permitida → error explícito, sin persistir ──

async function testExtensionNoPermitida() {
  const seeded = await seedInsumo();
  try {
    const t = token(seeded.tenantId);
    const bytes = new Uint8Array([0x4d, 0x5a]); // cabecera "MZ" de un .exe
    const r = await uploadFicha(baseUrl, t, seeded.insumoId, bytes, 'malicioso.exe', 'application/octet-stream');
    assert.equal(r.status, 400, 'extensión .exe no permitida debe rechazarse (400)');
    const body = await r.json() as any;
    assert.match(body.message, /Tipo de archivo no permitido/);

    const rList = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${seeded.insumoId}/fichas`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const listBody = await rList.json() as any;
    assert.equal(listBody.data.length, 0, 'el archivo rechazado no debe persistirse');

    console.log('ok - extensión no permitida (.exe) se rechaza sin persistir');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── 3: archivo que excede el límite de tamaño → MulterError LIMIT_FILE_SIZE ──

async function testExcedeLimiteTamano() {
  const seeded = await seedInsumo();
  try {
    const t = token(seeded.tenantId);
    // FICHAS_MAX_SIZE_MB=1 (ver arriba) — generar > 1 MiB para excederlo.
    const bytes = new Uint8Array(2 * 1024 * 1024);
    const r = await uploadFicha(baseUrl, t, seeded.insumoId, bytes, 'grande.pdf', 'application/pdf');
    assert.equal(r.status, 400, 'archivo que excede el límite debe rechazarse (400)');
    const body = await r.json() as any;
    assert.match(body.message, /supera el límite/);

    const rList = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${seeded.insumoId}/fichas`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const listBody = await rList.json() as any;
    assert.equal(listBody.data.length, 0, 'el archivo que excede el límite no debe persistirse');

    console.log('ok - archivo que excede el límite de tamaño se rechaza sin persistir');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testExtensionPermitida();
    await testExtensionNoPermitida();
    await testExcedeLimiteTamano();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - fichas-upload-multer integration tests');
  console.error(error);
  process.exitCode = 1;
});
