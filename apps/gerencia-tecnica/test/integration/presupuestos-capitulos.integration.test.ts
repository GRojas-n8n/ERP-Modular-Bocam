/**
 * Test de Integración: jerarquía de capítulos (Capitulo) dentro de un presupuesto
 * Spec: openspec/changes/wbs-jerarquico-conceptos/specs/jerarquia-capitulos-presupuesto/spec.md
 * Tareas: 5.1-5.4 del tasks.md
 *
 * Hoy `Concepto` es una lista plana: POST /presupuestos no crea ni asocia
 * ningún `Capitulo`, incluso si el archivo importado trae la referencia.
 * Este test confirma primero el gap (rojo) y luego valida el fix (verde).
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
  await (prisma as any).conceptoCatalogo.deleteMany({ where: { tenant_id: tenantId } });
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

// ── Test 5.1: conceptos con referencia de capítulo crean/reutilizan el Capitulo y asocian capitulo_id ──

async function testImportacionConCapitulosCreaYAsocia() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r = await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 1,
      conceptos: [
        { clave: 'PRE-001', descripcion: 'Limpieza de terreno', unidad_medida: 'M2', cantidad: 100, precio_unitario: 20, capitulo_clave: '01', capitulo_nombre: 'PRELIMINARES' },
        { clave: 'PRE-002', descripcion: 'Trazo y nivelación', unidad_medida: 'M2', cantidad: 100, precio_unitario: 15, capitulo_clave: '01', capitulo_nombre: 'PRELIMINARES' },
        { clave: 'CIM-001', descripcion: 'Excavación', unidad_medida: 'M3', cantidad: 50, precio_unitario: 120, capitulo_clave: '02', capitulo_nombre: 'CIMENTACIÓN' },
      ],
    });

    assert.equal(r.status, 201, 'la importación con capítulos debe crear el presupuesto');
    const body = await r.json() as any;
    const presupuestoId = body.data.id;

    const capitulos = await (prisma as any).capitulo.findMany({ where: { tenant_id: tenantId, presupuesto_id: presupuestoId } });
    assert.equal(capitulos.length, 2, 'deben crearse exactamente 2 capítulos (01 y 02), reutilizado para PRE-001/PRE-002');

    const capPreliminares = capitulos.find((c: any) => c.clave === '01');
    assert.ok(capPreliminares, 'debe existir el capítulo 01 PRELIMINARES');
    assert.equal(capPreliminares.nombre, 'PRELIMINARES');

    const pre001 = body.data.conceptos.find((c: any) => c.clave === 'PRE-001');
    const pre002 = body.data.conceptos.find((c: any) => c.clave === 'PRE-002');
    const cim001 = body.data.conceptos.find((c: any) => c.clave === 'CIM-001');

    assert.ok(pre001.capitulo_id, 'PRE-001 debe tener capitulo_id asociado');
    assert.equal(pre001.capitulo_id, pre002.capitulo_id, 'PRE-001 y PRE-002 deben compartir el mismo capitulo_id (mismo capítulo reutilizado)');
    assert.equal(pre001.capitulo_id, capPreliminares.id);
    assert.notEqual(cim001.capitulo_id, pre001.capitulo_id, 'CIM-001 debe tener un capitulo_id distinto (capítulo 02)');

    console.log('ok - 5.1 importación con capítulos crea/reutiliza Capitulo y asocia capitulo_id a cada concepto');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 5.2: concepto sin referencia de capítulo → capitulo_id = null, no rechaza la importación ──

async function testConceptoSinCapituloQuedaNull() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    const r = await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 1,
      conceptos: [
        { clave: 'SIN-001', descripcion: 'Concepto sin capítulo', unidad_medida: 'PZA', cantidad: 1, precio_unitario: 500 },
      ],
    });

    assert.equal(r.status, 201, 'la importación sin columna de capítulo no debe rechazarse');
    const body = await r.json() as any;
    const concepto = body.data.conceptos.find((c: any) => c.clave === 'SIN-001');
    assert.ok(concepto, 'el concepto debe crearse');
    assert.equal(concepto.capitulo_id, null, 'capitulo_id debe quedar null cuando no se especifica capítulo');

    const capitulos = await (prisma as any).capitulo.findMany({ where: { tenant_id: tenantId, presupuesto_id: body.data.id } });
    assert.equal(capitulos.length, 0, 'no debe crearse ningún capítulo si ningún concepto lo referencia');

    console.log('ok - 5.2 concepto sin capítulo especificado queda con capitulo_id null, sin rechazar la importación');
  } finally {
    await cleanupTenant(tenantId);
  }
}

// ── Test 5.3/5.4: GET /presupuesto/activo expone capitulo_id de forma aditiva ──

async function testPresupuestoActivoExponeCapituloId() {
  const tenantId = randomUUID();
  const proyectoId = randomUUID();
  try {
    const t = token(tenantId, proyectoId);

    await postPresupuesto({ Authorization: `Bearer ${t}` }, {
      proyecto_id: proyectoId,
      version: 1,
      conceptos: [
        { clave: 'ACT-001', descripcion: 'Concepto con capítulo', unidad_medida: 'PZA', cantidad: 1, precio_unitario: 10, capitulo_clave: '01', capitulo_nombre: 'PRELIMINARES' },
        { clave: 'ACT-002', descripcion: 'Concepto sin capítulo', unidad_medida: 'PZA', cantidad: 1, precio_unitario: 10 },
      ],
    });

    const r = await fetch(`${baseUrl}/api/v1/gerencia-tecnica/presupuesto/activo`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    assert.equal(r.status, 200);
    const body = await r.json() as any;

    const c1 = body.data.conceptos.find((c: any) => c.clave === 'ACT-001');
    const c2 = body.data.conceptos.find((c: any) => c.clave === 'ACT-002');
    assert.ok(c1, 'ACT-001 debe venir en la respuesta');
    assert.ok(c1.capitulo_id, 'GET /presupuesto/activo debe exponer capitulo_id (campo nuevo)');
    assert.equal(c2.capitulo_id, null, 'ACT-002 sin capítulo debe exponer capitulo_id null');

    // Campos preexistentes que consume control-proyectos siguen presentes (aditivo, no rompe el contrato).
    assert.ok('id' in c1 && 'clave' in c1 && 'descripcion' in c1 && 'unidad_medida' in c1 && 'precio_unitario' in c1 && 'cantidad' in c1,
      'los campos preexistentes del contrato de presupuesto/activo deben seguir presentes');

    console.log('ok - 5.3/5.4 GET /presupuesto/activo expone capitulo_id como campo nuevo aditivo, sin romper el contrato existente');
  } finally {
    await cleanupTenant(tenantId);
  }
}

async function main() {
  await setup();

  try {
    await testImportacionConCapitulosCreaYAsocia();   // 5.1
    await testConceptoSinCapituloQuedaNull();          // 5.2
    await testPresupuestoActivoExponeCapituloId();     // 5.3/5.4
  } finally {
    await teardown();
  }
}

void main().catch((error) => {
  console.error('not ok - presupuestos-capitulos integration tests');
  console.error(error);
  process.exitCode = 1;
});
