/**
 * Tests de Integración: comportamiento de subida de adjuntos de documentos (multer)
 * Spec:  openspec/changes/actualizar-multer-v2-seguridad/
 * Tarea: 1.4 del tasks.md — fija el comportamiento actual (multer 1.x) que la
 * actualización a 2.x NO debe alterar (ver specs/carga-archivos-multer).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

// calidad no expone override por env para su límite de tamaño (MAX_FILE_SIZE es una
// constante fija de 50 MB en src/types.ts, a diferencia de gerencia-tecnica/compras).
// Subir un archivo real de 51 MB por HTTP en este runner cuelga indefinidamente (probado:
// >30 min sin resolver, ver openspec/changes/actualizar-multer-v2-seguridad). En vez de
// tocar la lógica de negocio, se reduce el límite en memoria ANTES de importar `main.ts`
// mutando el objeto exportado (singleton de require) — mismo código de producción, límite
// más chico solo para este proceso de test.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typesModule = require('../../src/types');
const SMALL_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MiB
typesModule.MAX_FILE_SIZE = SMALL_MAX_FILE_SIZE;

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const dbUrl =
  process.env.CALIDAD_DATABASE_URL ||
  process.env.DATABASE_URL         ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=calidad';

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
  await prisma.versionDocumento.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.documento.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedDocumento() {
  const tenantId = randomUUID();
  const userId = randomUUID();

  const doc = await prisma.documento.create({
    data: {
      tenant_id: tenantId,
      codigo: `DOC-MUL-${Date.now().toString().slice(-8)}`,
      titulo: 'Documento prueba upload multer',
      tipo: 'OTRO',
      responsable_id: userId,
    },
  });

  return { tenantId, userId, documentoId: doc.id_documento };
}

function token(tenantId: string, userId: string) {
  return signTenantToken({ userId, tenantId, proyectoId: randomUUID(), roles: ['calidad'] });
}

function postVersion(documentoId: string, t: string, bytes: Uint8Array, filename: string, mime: string, numeroVersion: string) {
  const form = new FormData();
  form.append('archivo', new Blob([bytes], { type: mime }), filename);
  form.append('numero_version', numeroVersion);
  form.append('cambios', 'Versión de prueba multer');
  return fetch(`${baseUrl}/api/v1/calidad/documentos/${documentoId}/versiones`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}` },
    body: form,
  });
}

// ── 1: extensión permitida → 201 ──

async function testExtensionPermitida() {
  const seeded = await seedDocumento();
  try {
    const t = token(seeded.tenantId, seeded.userId);
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    const r = await postVersion(seeded.documentoId, t, bytes, 'plano.pdf', 'application/pdf', '1.0');
    assert.equal(r.status, 201, 'extensión .pdf permitida debe aceptarse (201)');

    console.log('ok - extensión permitida (.pdf) sube con éxito (calidad)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── 2: extensión no permitida → error explícito, sin persistir ──

async function testExtensionNoPermitida() {
  const seeded = await seedDocumento();
  try {
    const t = token(seeded.tenantId, seeded.userId);
    const bytes = new Uint8Array([0x4d, 0x5a]);
    const r = await postVersion(seeded.documentoId, t, bytes, 'malicioso.exe', 'application/octet-stream', '1.0');
    assert.equal(r.status, 400, 'extensión .exe no permitida debe rechazarse (400)');
    const body = await r.json() as any;
    assert.match(body.message, /Tipo de archivo no permitido/);

    const versiones = await prisma.versionDocumento.findMany({ where: { documento_id: seeded.documentoId } });
    assert.equal(versiones.length, 0, 'el archivo rechazado no debe persistirse ni crear versión');

    console.log('ok - extensión no permitida (.exe) se rechaza sin persistir (calidad)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── 3: archivo que excede el límite de tamaño (50 MB, hardcoded) → 400, sin persistir ──

async function testExcedeLimiteTamano() {
  const seeded = await seedDocumento();
  try {
    const t = token(seeded.tenantId, seeded.userId);
    const bytes = new Uint8Array(SMALL_MAX_FILE_SIZE + 1024); // > límite reducido para el test (ver arriba)
    const r = await postVersion(seeded.documentoId, t, bytes, 'grande.pdf', 'application/pdf', '1.0');
    assert.equal(r.status, 400, 'archivo que excede el límite debe rechazarse (400)');
    const body = await r.json() as any;
    assert.match(body.message, /supera el límite/);

    const versiones = await prisma.versionDocumento.findMany({ where: { documento_id: seeded.documentoId } });
    assert.equal(versiones.length, 0, 'el archivo que excede el límite no debe persistirse ni crear versión');

    console.log('ok - archivo que excede el límite de tamaño se rechaza sin persistir (calidad)');
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

// A diferencia de gerencia-tecnica/compras, apps/calidad/src/main.ts arranca su propio
// servidor (startServer()) como efecto de módulo al importarse, y su EventBus reintenta
// conectar indefinidamente — ambos mantienen vivo el event loop aunque main() ya haya
// terminado. Se fuerza la salida explícitamente para no dejar el proceso colgado.
void main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('not ok - adjuntos-upload-multer integration tests');
    console.error(error);
    process.exit(1);
  });
