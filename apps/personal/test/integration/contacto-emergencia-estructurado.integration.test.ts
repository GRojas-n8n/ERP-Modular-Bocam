/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: contacto de emergencia estructurado (nombre,
 * teléfono, parentesco) en alta y edición de Empleado
 * Spec:  openspec/changes/estructurar-contacto-emergencia-empleado/specs/
 *        contacto-emergencia-empleado/spec.md
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

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
}

async function cleanupTenant(tenantId: string) {
  await prisma.empleado.deleteMany({ where: { tenant_id: tenantId } });
}

async function post(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(pathUrl: string, token: string, body: unknown) {
  return fetch(`${personalBaseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Test 1: alta con los 3 campos de contacto de emergencia ────────────────

async function testAltaConContactoEmergenciaCompleto() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await post('/api/v1/personal/empleados', token, {
      nombre: 'Juan', apellido_paterno: 'Pérez', rfc: `CEE${sufijo}A`,
      puesto: 'Obrero', salario_diario: 300,
      contacto_emergencia_nombre: 'María Pérez',
      contacto_emergencia_telefono: '5551234567',
      contacto_emergencia_parentesco: 'Esposa',
    });
    assert.equal(r.status, 201, 'debe crear el empleado con los 3 campos de contacto de emergencia');
    const body = (await r.json()) as any;
    assert.equal(body.data.contacto_emergencia_nombre, 'María Pérez');
    assert.equal(body.data.contacto_emergencia_telefono, '5551234567');
    assert.equal(body.data.contacto_emergencia_parentesco, 'Esposa');

    console.log('ok - POST /empleados: crea con contacto_emergencia_nombre/telefono/parentesco');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 2: alta sin contacto de emergencia deja los 3 campos en null ──────

async function testAltaSinContactoEmergencia() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await post('/api/v1/personal/empleados', token, {
      nombre: 'Ana', apellido_paterno: 'Gómez', rfc: `CEE${sufijo}B`,
      puesto: 'Obrero', salario_diario: 300,
    });
    assert.equal(r.status, 201);
    const body = (await r.json()) as any;
    assert.equal(body.data.contacto_emergencia_nombre, null);
    assert.equal(body.data.contacto_emergencia_telefono, null);
    assert.equal(body.data.contacto_emergencia_parentesco, null);

    console.log('ok - POST /empleados: sin contacto de emergencia, los 3 campos quedan en null');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 3: editar solo el teléfono no afecta nombre/parentesco existentes ─

async function testEditarSoloTelefonoDeContactoEmergencia() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  try {
    const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const emp = await prisma.empleado.create({
      data: {
        tenant_id: tenantId,
        numero_empleado: `EMP-${sufijo}`,
        nombre: 'Luis', apellido_paterno: 'Ramírez',
        rfc: `CEE${sufijo}C`,
        puesto: 'Obrero',
        fecha_ingreso: new Date('2026-01-01'),
        salario_diario: 300,
        estado: 'ACTIVO',
        contacto_emergencia_nombre: 'Rosa Ramírez',
        contacto_emergencia_parentesco: 'Madre',
      },
    });

    const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, token, {
      contacto_emergencia_telefono: '5559876543',
    });
    assert.equal(r.status, 200);
    const body = (await r.json()) as any;
    assert.equal(body.data.contacto_emergencia_telefono, '5559876543');
    assert.equal(body.data.contacto_emergencia_nombre, 'Rosa Ramírez', 'el nombre no debe modificarse');
    assert.equal(body.data.contacto_emergencia_parentesco, 'Madre', 'el parentesco no debe modificarse');

    console.log('ok - PATCH /empleados/:id: editar solo el teléfono conserva nombre y parentesco');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAltaConContactoEmergenciaCompleto();
    await testAltaSinContactoEmergencia();
    await testEditarSoloTelefonoDeContactoEmergencia();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - contacto-emergencia-estructurado integration tests');
  console.error(error);
  process.exitCode = 1;
});
