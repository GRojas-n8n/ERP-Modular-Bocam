/**
 * Test de Integración: unicidad de clave de concepto dentro de un mismo
 * presupuesto (lote importado)
 * Spec: openspec/changes/wbs-jerarquico-conceptos/specs/jerarquia-capitulos-presupuesto/spec.md
 * Tareas: 3.1-3.3 del tasks.md
 *
 * Hoy POST /presupuestos crea conceptos duplicados dentro del mismo lote sin
 * avisar (no hay ninguna validación ni restricción de unicidad de `clave`).
 * Este test confirma primero el bug (rojo) y luego valida el fix (verde).
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
  await prisma.presupuestoBase.deleteMany({ where: { tenant_id: tenantId } });
}

function token(tenantId: string, proyectoId: string, roles: string[] = ['admin']) {
  return signTenantToken({ userId: randomUUID(), tenantId, proyectoId, roles });
}

async function postPresupuesto(baseHeaders: Record<string, string>, body: unknown) {
  return fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuestos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...baseHeaders },
    body: JSON.stringify(body),
  });
}

// ── Test 3.1: dos conceptos con la misma clave en el mismo lote → 422 ──

async function testDosConceptosMismaClaveRechazado() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r = await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 1,
      conceptos: [
        { clave: 'CIM-001', descripcion: 'Cimentación A', unidad_medida: 'M3', cantidad: 10, precio_unitario: 100 },
        { clave: 'CIM-001', descripcion: 'Cimentación B (duplicada)', unidad_medida: 'M3', cantidad: 5, precio_unitario: 200 },
      ],
    });

    assert.equal(r.status, 422, 'POST /presupuestos con clave duplicada en el mismo lote debe responder 422');
    const body = await r.json() as any;
    assert.equal(body.success, false, 'la respuesta debe indicar success:false');
    assert.match(String(body.error?.message ?? ''), /CIM-001/, 'el mensaje debe indicar la clave duplicada');

    const conceptosCreados = await prisma.concepto.count({ where: { tenant_id: tenantId, clave: 'CIM-001' } });
    assert.equal(conceptosCreados, 0, 'no debe crearse ningún concepto de un lote rechazado por clave duplicada');

    console.log('ok - 3.1 dos conceptos con la misma clave en el mismo lote responde 422 y no crea nada');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 3.2: claves únicas → 201, no regresión ──

async function testClavesUnicasSiguenCreando() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r = await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 1,
      conceptos: [
        { clave: 'CIM-001', descripcion: 'Cimentación', unidad_medida: 'M3', cantidad: 10, precio_unitario: 100 },
        { clave: 'CIM-002', descripcion: 'Cimentación 2', unidad_medida: 'M3', cantidad: 5, precio_unitario: 200 },
      ],
    });

    assert.equal(r.status, 201, 'POST /presupuestos con claves únicas debe seguir respondiendo 201');
    const body = await r.json() as any;
    assert.equal(body.data.conceptos.length, 2, 'deben crearse los 2 conceptos');

    console.log('ok - 3.2 claves únicas dentro del lote siguen creando el presupuesto (no regresión)');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 3.3: versión 2 reutiliza claves de versión 1 → 201, no bloqueado entre presupuesto_id distintos ──

async function testVersionNuevaReutilizaClaves() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r1 = await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 1,
      conceptos: [
        { clave: 'CIM-001', descripcion: 'Cimentación', unidad_medida: 'M3', cantidad: 10, precio_unitario: 100 },
      ],
    });
    assert.equal(r1.status, 201, 'la versión 1 debe crearse correctamente');

    const r2 = await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 2,
      conceptos: [
        { clave: 'CIM-001', descripcion: 'Cimentación (actualizada)', unidad_medida: 'M3', cantidad: 12, precio_unitario: 110 },
      ],
    });
    assert.equal(r2.status, 201, 'la versión 2 debe poder reutilizar las claves de la versión 1 (distinto presupuesto_id)');

    const totalConceptos = await prisma.concepto.count({ where: { tenant_id: tenantId, clave: 'CIM-001' } });
    assert.equal(totalConceptos, 2, 'deben existir 2 filas de concepto CIM-001, una por cada versión de presupuesto');

    console.log('ok - 3.3 una versión nueva de presupuesto reutiliza claves de la versión anterior sin bloquearse');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testDosConceptosMismaClaveRechazado();   // 3.1
    await testClavesUnicasSiguenCreando();          // 3.2
    await testVersionNuevaReutilizaClaves();        // 3.3
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - presupuestos-unicidad-clave integration tests');
  console.error(error);
  process.exitCode = 1;
});
