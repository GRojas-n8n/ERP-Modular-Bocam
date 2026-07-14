/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: comportamiento de subida de PDF de cotización (multer)
 * Spec:  openspec/changes/actualizar-multer-v2-seguridad/
 * Tarea: 1.2 del tasks.md — fija el comportamiento actual (multer 1.x, instancia
 * `cotizacionesMulter`) que la actualización a 2.x NO debe alterar (ver
 * specs/carga-archivos-multer).
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (EventBus falla silenciosamente)
 * ---------------------------------------------------------------------------
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = 'amqp://invalid-host:9999';
process.env.COTIZACIONES_UPLOAD_DIR = path.join(os.tmpdir(), `cotizaciones-multer-test-${Date.now()}`);
process.env.COTIZACIONES_MAX_SIZE_MB = process.env.COTIZACIONES_MAX_SIZE_MB || '1'; // bajo a propósito para poder excederlo

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
  try { fs.rmSync(process.env.COTIZACIONES_UPLOAD_DIR!, { recursive: true, force: true }); } catch (_) {}
}

async function cleanupTenant(tenantId: string) {
  await prisma.comparativaProveedorArchivo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.comparativaDetalle.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.cuadroComparativo.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.proveedor.deleteMany({ where: { tenant_id: tenantId } });
}

async function seedCuadro() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();

  const proveedor = await prisma.proveedor.create({
    data: {
      tenant_id: tenantId,
      rfc_tax_id: `RFC-MUL-${Date.now().toString().slice(-8)}`,
      razon_social: 'Proveedor Multer Test',
      estatus: 'ACTIVO',
    },
  });

  const cuadro = await prisma.cuadroComparativo.create({
    data: {
      tenant_id: tenantId,
      proyecto_id: proyectoId,
      requisicion_id: randomUUID(),
      codigo: `CC-MUL-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      estado: 'BORRADOR',
    },
  });

  return { tenantId, proyectoId, userId, cuadroId: cuadro.id_cuadro, proveedorId: proveedor.id_proveedor };
}

function putPdf(cuadroId: string, provId: string, token: string, bytes: Uint8Array, filename: string, mime: string) {
  const form = new FormData();
  form.append('archivo', new Blob([bytes], { type: mime }), filename);
  return fetch(`${comprasBaseUrl}/api/v1/compras/comparativas/${cuadroId}/proveedores/${provId}/cotizacion-pdf`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

// ── 1: extensión permitida (.pdf) → 200 ──

async function testExtensionPermitida() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    const r = await putPdf(seeded.cuadroId, seeded.proveedorId, token, bytes, 'cotizacion.pdf', 'application/pdf');
    assert.equal(r.status, 200, 'extensión .pdf permitida debe aceptarse (200)');

    console.log('ok - extensión permitida (.pdf) sube con éxito (cotizacionesMulter)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── 2: extensión no permitida → error explícito, sin persistir ──

async function testExtensionNoPermitida() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const bytes = new Uint8Array([0x4d, 0x5a]);
    const r = await putPdf(seeded.cuadroId, seeded.proveedorId, token, bytes, 'malicioso.exe', 'application/octet-stream');
    assert.equal(r.status, 400, 'extensión .exe no permitida debe rechazarse (400)');
    const body = await r.json() as any;
    assert.match(body.message, /Tipo de archivo no permitido/);

    const archivo = await prisma.comparativaProveedorArchivo.findUnique({
      where: { cuadro_id_proveedor_id: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId } },
    });
    assert.equal(archivo, null, 'el archivo rechazado no debe persistirse');

    console.log('ok - extensión no permitida (.exe) se rechaza sin persistir (cotizacionesMulter)');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── 3: archivo que excede el límite de tamaño → 400, sin persistir ──

async function testExcedeLimiteTamano() {
  const seeded = await seedCuadro();
  try {
    const token = signTenantToken({ userId: seeded.userId, tenantId: seeded.tenantId, proyectoId: seeded.proyectoId, roles: ['procurement'] });
    const bytes = new Uint8Array(2 * 1024 * 1024); // 2 MiB > COTIZACIONES_MAX_SIZE_MB=1
    const r = await putPdf(seeded.cuadroId, seeded.proveedorId, token, bytes, 'grande.pdf', 'application/pdf');
    assert.equal(r.status, 400, 'archivo que excede el límite debe rechazarse (400)');

    const archivo = await prisma.comparativaProveedorArchivo.findUnique({
      where: { cuadro_id_proveedor_id: { cuadro_id: seeded.cuadroId, proveedor_id: seeded.proveedorId } },
    });
    assert.equal(archivo, null, 'el archivo que excede el límite no debe persistirse');

    console.log('ok - archivo que excede el límite de tamaño se rechaza sin persistir (cotizacionesMulter)');
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
  console.error('not ok - cotizacion-pdf-upload-multer integration tests');
  console.error(error);
  process.exitCode = 1;
});
