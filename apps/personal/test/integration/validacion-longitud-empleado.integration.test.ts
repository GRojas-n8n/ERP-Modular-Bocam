/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación de longitud de campos de texto de Empleado
 * Spec:  openspec/changes/fix-personal-validacion-longitud-empleado/
 * Tarea: 1.1-1.3 del tasks.md
 *
 * Bug reportado en producción (verificación manual de
 * aislamiento-proyecto-por-modulo, tarea 7.4): un RFC más largo que la
 * columna (`VARCHAR(13)`) hacía que POST /empleados respondiera 500 con
 * el mensaje crudo de Prisma. Este archivo reproduce el bug en los tres
 * puntos de entrada (alta individual, edición, importación masiva) antes
 * del fix, y confirma el 400 claro después.
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

async function crearEmpleado(tenantId: string) {
  const sufijo = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return prisma.empleado.create({
    data: {
      tenant_id: tenantId,
      numero_empleado: `EMP-${sufijo}`,
      nombre: 'Test', apellido_paterno: 'Longitud',
      rfc: `TLO${sufijo}`,
      puesto: 'Obrero',
      fecha_ingreso: new Date('2026-01-01'),
      salario_diario: 300,
      estado: 'ACTIVO',
    },
  });
}

async function post(path: string, token: string, body: object) {
  return fetch(`${personalBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(path: string, token: string, body: object) {
  return fetch(`${personalBaseUrl}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── 1.1 — alta individual con RFC más largo que la columna ─────────────────

async function testAltaConRfcDemasiadoLargo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

  try {
    const r = await post('/api/v1/personal/empleados', token, {
      nombre: 'Juan', apellido_paterno: 'Pérez',
      rfc: 'ESTE-RFC-ES-DEMASIADO-LARGO-PARA-LA-COLUMNA',
      puesto: 'Fierrero', salario_diario: 350,
    });

    assert.equal(r.status, 400, 'debe responder 400, no 500 con el mensaje crudo de Prisma');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(
      body.error.details?.some((d: any) => d.field === 'rfc'),
      'el detalle debe nombrar el campo rfc'
    );

    const creado = await prisma.empleado.findFirst({ where: { tenant_id: tenantId } });
    assert.equal(creado, null, 'no debe crearse ningún registro');

    console.log('ok - POST /empleados con rfc demasiado largo responde 400 claro, sin crear el registro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.1b — alta individual con campos dentro del límite sigue funcionando ──

async function testAltaConCamposValidosSigueFuncionando() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
  const sufijo = Date.now().toString().slice(-6);

  try {
    const r = await post('/api/v1/personal/empleados', token, {
      nombre: 'Juan', apellido_paterno: 'Pérez',
      rfc: `PEJ${sufijo}A`,
      puesto: 'Fierrero', salario_diario: 350,
    });

    assert.equal(r.status, 201, 'un alta con campos dentro del límite no debe verse afectada por el fix');
    console.log('ok - POST /empleados con campos válidos sigue creando el empleado con normalidad');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.2 — edición con contacto_emergencia_telefono más largo que la columna ─

async function testEdicionConContactoEmergenciaTelefonoDemasiadoLargo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });

  try {
    const emp = await crearEmpleado(tenantId);

    const r = await patch(`/api/v1/personal/empleados/${emp.id_empleado}`, token, {
      contacto_emergencia_telefono: '01234567890123456789012345678901',
    });

    assert.equal(r.status, 400, 'debe responder 400, no 500 con el mensaje crudo de Prisma');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(
      body.error.details?.some((d: any) => d.field === 'contacto_emergencia_telefono'),
      'el detalle debe nombrar el campo contacto_emergencia_telefono'
    );

    const sinCambios = await prisma.empleado.findUnique({ where: { id_empleado: emp.id_empleado } });
    assert.equal(sinCambios?.contacto_emergencia_telefono, null, 'el registro no debe modificarse');

    console.log('ok - PATCH /empleados/:id con contacto_emergencia_telefono demasiado largo responde 400 claro');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── 1.3 — importación masiva: una fila con CURP demasiado largo, el resto válido ─

async function testImportacionConUnaFilaCurpDemasiadoLargo() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  const userId = randomUUID();
  const token = signTenantToken({ userId, tenantId, proyectoId, roles: ['personal_rh'] });
  const sufijo = Date.now().toString().slice(-6);

  try {
    const r = await post('/api/v1/personal/empleados/importar-lote', token, {
      registros: [
        {
          nombre: 'Ana', apellido_paterno: 'García', rfc: `GAA${sufijo}B`,
          curp: 'ESTE-CURP-ES-DEMASIADO-LARGO-PARA-LA-COLUMNA',
          puesto: 'Operador', salario_diario: 400,
        },
        { nombre: 'Juan', apellido_paterno: 'Pérez', rfc: `PEJ${sufijo}A`, puesto: 'Fierrero', salario_diario: 350 },
      ],
    });

    assert.equal(r.status, 200, 'el lote no debe abortar completo por una fila inválida');
    const body = (await r.json()) as any;
    assert.equal(body.data.creados, 1, 'solo la fila válida debe crearse');
    assert.equal(body.data.errores.length, 1, 'la fila con curp demasiado largo debe reportarse como error');
    assert.equal(body.data.errores[0].fila, 1, 'debe reportar la fila 1 (la del curp inválido)');
    assert.match(body.data.errores[0].motivo, /curp/i, 'el motivo debe mencionar el campo curp');

    console.log('ok - importar-lote reporta por fila un curp demasiado largo, sin abortar el resto del lote');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testAltaConRfcDemasiadoLargo();
    await testAltaConCamposValidosSigueFuncionando();
    await testEdicionConContactoEmergenciaTelefonoDemasiadoLargo();
    await testImportacionConUnaFilaCurpDemasiadoLargo();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-longitud-empleado integration tests');
  console.error(error);
  process.exitCode = 1;
});
