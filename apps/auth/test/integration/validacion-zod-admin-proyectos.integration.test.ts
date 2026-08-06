/**
 * ---------------------------------------------------------------------------
 * Tests de Integración: validación Zod — POST /api/v1/auth/admin/proyectos y
 * PATCH /api/v1/auth/admin/proyectos/:id
 * Spec:  openspec/changes/validacion-zod-endpoints-auth/specs/validacion-entrada-zod/
 * Tareas: 4.2, 4.3
 *
 * Runner: node -r ts-node/register/transpile-only <este-archivo>
 * Requiere: PostgreSQL corriendo (DATABASE_URL en .env de apps/auth)
 * ---------------------------------------------------------------------------
 */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'bocam-e2e-secret';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { PrismaClient } from '../../src/generated/prisma';
import { signTenantToken, startHttpApp, stopHttpApp } from '../../../../test-support/e2e';

const authDbUrl = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ datasources: { db: { url: authDbUrl } } });

let authServer: Server | undefined;
let authBaseUrl = '';

async function setup() {
  const authModule = await import('../../src/main');
  const started = await startHttpApp(authModule.app);
  authServer = started.server;
  authBaseUrl = started.baseUrl;
}

async function teardown() {
  await stopHttpApp(authServer);
  await prisma.$disconnect();
}

async function seedTenant(tenantId: string) {
  await prisma.tenant.create({ data: { id_tenant: tenantId, nombre: 'Tenant Test Admin Proyectos Zod', rfc: `RFC${Date.now().toString().slice(-9)}` } });
}

async function cleanupTenant(tenantId: string) {
  await prisma.proyecto.deleteMany({ where: { tenant_id: tenantId } });
  await prisma.tenant.deleteMany({ where: { id_tenant: tenantId } });
}

function gtToken(tenantId: string) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId: randomUUID(), roles: ['gerencia_tecnica'] });
}

async function post(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(pathUrl: string, token: string, body: object) {
  return fetch(`${authBaseUrl}${pathUrl}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const clienteIdTest = randomUUID();

// ── POST /api/v1/auth/admin/proyectos ────────────────────────────────────────

async function testCrearProyectoPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const r = await post('/api/v1/auth/admin/proyectos', gtToken(tenantId), {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteIdTest, codigo_cliente: '099',
      nombre_oficial: 'Proyecto Validación Zod',
      fecha_programada_inicio: '2026-01-01', fecha_programada_fin: '2026-06-30',
      monto_total_vendido: 500000,
    });
    assert.equal(r.status, 201, 'un payload con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.data.nombre_oficial, 'Proyecto Validación Zod');
    console.log('ok - admin/proyectos POST: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCrearProyectoRechazaNombreOficialFaltante() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const r = await post('/api/v1/auth/admin/proyectos', gtToken(tenantId), {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteIdTest, codigo_cliente: '098',
    });
    assert.equal(r.status, 400, 'nombre_oficial faltante debe rechazarse con 400');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((d: any) => d.field === 'nombre_oficial'));

    const enBd = await prisma.proyecto.findMany({ where: { tenant_id: tenantId } });
    assert.equal(enBd.length, 0, 'no debe haberse creado ningún proyecto');
    console.log('ok - admin/proyectos POST: nombre_oficial faltante responde 400 VALIDATION_ERROR sin tocar Prisma');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCrearProyectoRechazaMontoComoString() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const r = await post('/api/v1/auth/admin/proyectos', gtToken(tenantId), {
      empresa_grupo: 'HCO', anio_centro_costos: 2026, cliente_id: clienteIdTest, codigo_cliente: '097',
      nombre_oficial: 'Proyecto Monto Inválido',
      monto_total_vendido: 'un millón',
    });
    assert.equal(r.status, 400, 'monto_total_vendido como string debe rechazarse con 400');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((d: any) => d.field === 'monto_total_vendido'));
    console.log('ok - admin/proyectos POST: monto_total_vendido con forma inesperada (string) responde 400 VALIDATION_ERROR');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testCrearProyectoEspecialSigueFuncionando() {
  // Confirma que la lógica de negocio (TIPOS_ESPECIALES, chequeo condicional
  // por es_especial) sigue intacta tras el schema — Zod solo valida forma.
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  try {
    const r = await post('/api/v1/auth/admin/proyectos', gtToken(tenantId), {
      es_especial: true, tipo_especial: 'OFICINA', codigo_centro_costos: `OFICINA-ZOD-${Date.now()}`,
      nombre_oficial: 'Oficina Validación Zod',
    });
    assert.equal(r.status, 201, 'alta especial debe seguir funcionando igual que antes');
    console.log('ok - admin/proyectos POST: alta especial (es_especial=true) sigue funcionando tras el schema');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── PATCH /api/v1/auth/admin/proyectos/:id ───────────────────────────────────

async function testActualizarProyectoPayloadValidoSigueFuncionando() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  const proyectoId = randomUUID();
  await prisma.proyecto.create({
    data: { id_proyecto: proyectoId, tenant_id: tenantId, codigo_centro_costos: `CC-PATCH-${Date.now()}`, nombre_oficial: 'Original' },
  });
  try {
    const r = await patch(`/api/v1/auth/admin/proyectos/${proyectoId}`, gtToken(tenantId), { nombre_oficial: 'Actualizado', activo: false });
    assert.equal(r.status, 200, 'un payload de PATCH con la misma forma que hoy debe seguir aceptándose');
    const body = (await r.json()) as any;
    assert.equal(body.data.nombre_oficial, 'Actualizado');
    console.log('ok - admin/proyectos PATCH: payload válido sigue funcionando igual que antes');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function testActualizarProyectoRechazaFechaComoObjeto() {
  const tenantId = randomUUID();
  await seedTenant(tenantId);
  const proyectoId = randomUUID();
  await prisma.proyecto.create({
    data: { id_proyecto: proyectoId, tenant_id: tenantId, codigo_centro_costos: `CC-PATCH2-${Date.now()}`, nombre_oficial: 'Original' },
  });
  try {
    const r = await patch(`/api/v1/auth/admin/proyectos/${proyectoId}`, gtToken(tenantId), {
      fecha_programada_inicio: { year: 2026, month: 1, day: 1 },
    });
    assert.equal(r.status, 400, 'fecha_programada_inicio como objeto debe rechazarse con 400');
    const body = (await r.json()) as any;
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((d: any) => d.field === 'fecha_programada_inicio'));
    console.log('ok - admin/proyectos PATCH: fecha con forma inesperada (objeto) responde 400 VALIDATION_ERROR');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();
  try {
    await testCrearProyectoPayloadValidoSigueFuncionando();
    await testCrearProyectoRechazaNombreOficialFaltante();
    await testCrearProyectoRechazaMontoComoString();
    await testCrearProyectoEspecialSigueFuncionando();
    await testActualizarProyectoPayloadValidoSigueFuncionando();
    await testActualizarProyectoRechazaFechaComoObjeto();
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - validacion-zod-admin-proyectos integration tests');
  console.error(error);
  process.exitCode = 1;
});
