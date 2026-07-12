/**
 * Tests de Integración: acceso del rol Residente a fichas técnicas de insumo
 * Spec:  openspec/changes/adjuntos-requisicion-invitacion-cotizar/
 * Tareas: 1.1-1.2 del tasks.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * No requiere: RabbitMQ (RABBITMQ_URL inválido → EventBus silencioso)
 */

process.env.JWT_SECRET   = process.env.JWT_SECRET   || 'bocam-e2e-secret';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://invalid-host:9999';

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
      clave: `FT-${Date.now()}`,
      descripcion: 'Insumo de prueba fichas técnicas',
      unidad_medida: 'PZA',
      tipo_insumo: 'MATERIAL',
      costo_base: 100,
    },
  });
  return { tenantId, insumoId: insumo.id };
}

function token(tenantId: string, roles: string[]) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles });
}

function buildFichaFormData(): FormData {
  const form = new FormData();
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
  form.append('archivo', new Blob([bytes], { type: 'application/pdf' }), 'ficha-tecnica.pdf');
  form.append('nombre_doc', 'ficha-tecnica.pdf');
  return form;
}

// ── Test 1.1: rol residencia puede subir y listar fichas técnicas ──

async function testResidenciaPuedeSubirYListarFichas() {
  const seeded = await seedInsumo();
  try {
    const t = token(seeded.tenantId, ['residencia']);

    const rUpload = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${seeded.insumoId}/fichas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: buildFichaFormData(),
    });
    assert.equal(rUpload.status, 201, 'residencia debe poder subir una ficha técnica (201)');

    const rList = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${seeded.insumoId}/fichas`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    assert.equal(rList.status, 200, 'residencia debe poder listar fichas técnicas (200)');
    const body = await rList.json() as any;
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].nombre_doc, 'ficha-tecnica.pdf');

    console.log('ok - 1.1 residencia puede subir y listar fichas técnicas de un insumo');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

// ── Test 1.2: un rol sin acceso sigue recibiendo 403 ──

async function testRolSinAccesoSigueBloqueado() {
  const seeded = await seedInsumo();
  try {
    const t = token(seeded.tenantId, ['finance']);

    const rUpload = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${seeded.insumoId}/fichas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: buildFichaFormData(),
    });
    assert.equal(rUpload.status, 403, 'finance no debe poder subir fichas técnicas');

    const rList = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/insumos/${seeded.insumoId}/fichas`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    assert.equal(rList.status, 403, 'finance no debe poder listar fichas técnicas');

    console.log('ok - 1.2 un rol sin acceso (finance) sigue recibiendo 403 en ambos endpoints');
  } finally {
    await cleanupTenant(seeded.tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testResidenciaPuedeSubirYListarFichas(); // 1.1
    await testRolSinAccesoSigueBloqueado();          // 1.2
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - fichas-tecnicas-residente integration tests');
  console.error(error);
  process.exitCode = 1;
});
