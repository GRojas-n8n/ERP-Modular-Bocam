/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: subida de documentos del expediente (multer)
 * Spec:  openspec/changes/bump-dependencias-cve-multer-nodemailer-express/
 *        (requisito "preservar el comportamiento de subida de archivos")
 * Tarea: 3.6 del tasks.md — fija el comportamiento de los límites de multer
 *        para que un bump de versión no lo altere en silencio.
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

// Directorio de subida propio del test (el valor por defecto `/tmp/personal-uploads`
// no resuelve en Windows). Debe fijarse ANTES de importar `main.ts`.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const UPLOAD_DIR_TEST = fs.mkdtempSync(path.join(os.tmpdir(), 'personal-uploads-test-'));
process.env.PERSONAL_UPLOAD_DIR = UPLOAD_DIR_TEST;

// personal no expone override por env para su límite (MAX_FILE_SIZE_EXPEDIENTE es una
// constante de 50 MB en src/types.ts). Subir 51 MB por HTTP en este runner es lento e
// inestable (mismo caso documentado en calidad), así que se reduce el límite en memoria
// ANTES de importar `main.ts`: mismo código de producción, límite más chico solo para
// este proceso de test.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typesModule = require('../../src/types');
const SMALL_MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MiB
typesModule.MAX_FILE_SIZE_EXPEDIENTE = SMALL_MAX_FILE_SIZE;

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const personalDbUrl =
  process.env.PERSONAL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=personal';

const prisma = new PrismaClient({ datasources: { db: { url: personalDbUrl } } });

let personalServer: Server | undefined;
let personalBaseUrl = '';

async function setup() {
  const personalModule = await import('../../src/main');
  const started = await startHttpApp(personalModule.app);
  personalServer = started.server;
  personalBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(personalServer);
  await prisma.$disconnect();
  fs.rmSync(UPLOAD_DIR_TEST, { recursive: true, force: true });
}

async function cleanupTenant(tenantId: string) {
  await prisma.documentoEmpleado.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'UploadMulter',
      rfc: `TUM${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

function pdfFormData(bytes: Buffer | string, filename = 'ine.pdf') {
  const fd = new FormData();
  fd.append('tipo_documento', 'INE');
  fd.append('archivo', new Blob([bytes], { type: 'application/pdf' }), filename);
  return fd;
}

async function upload(pathUrl: string, token: string, fd: FormData) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd as any,
  });
}

function archivosResiduales(): string[] {
  const acc: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else acc.push(p);
    }
  };
  walk(UPLOAD_DIR_TEST);
  return acc;
}

// ── Test: archivo dentro del límite sube con éxito ──────────────────────────

async function testArchivoDentroDelLimite() {
  const tenantId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['personal_rh'] });

    const r = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, token, pdfFormData('%PDF-1.4 pequeño'));
    assert.equal(r.status, 201, 'un PDF dentro del límite debe subir con 201');

    const count = await prisma.documentoEmpleado.count({ where: { tenant_id: tenantId } });
    assert.equal(count, 1, 'el documento debe quedar persistido');
    console.log('ok - archivo dentro del límite sube con éxito (personal)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test: archivo por encima del límite se rechaza sin persistir ────────────

async function testArchivoExcedeLimite() {
  const tenantId = randomUUID();
  try {
    const emp = await crearEmpleado(tenantId);
    const token = signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['personal_rh'] });
    const antes = archivosResiduales().length;

    const grande = Buffer.alloc(SMALL_MAX_FILE_SIZE + 1024, 0x25); // > límite
    const r = await upload(`/api/v1/personal/empleados/${emp.id_empleado}/documentos`, token, pdfFormData(grande, 'grande.pdf'));
    // Contrato actual (idéntico en multer 2.2.0 y 2.4.0): el error de límite de multer
    // sale como 400 por el manejador de errores de personal.
    assert.equal(r.status, 400, 'un archivo mayor al límite debe rechazarse con 400');

    const count = await prisma.documentoEmpleado.count({ where: { tenant_id: tenantId } });
    assert.equal(count, 0, 'el documento rechazado NO debe persistirse en base');
    assert.equal(archivosResiduales().length, antes, 'no deben quedar archivos huérfanos en disco');
    console.log('ok - archivo que excede el límite de tamaño se rechaza sin persistir (personal)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testArchivoDentroDelLimite();
    await testArchivoExcedeLimite();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - expediente-upload-multer integration tests');
  console.error(error);
  process.exitCode = 1;
});
